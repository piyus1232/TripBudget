import dayjs from "dayjs";
import { ApiError } from "../utils/ApiError.js";
import { Prettify } from "../utils/prettify.js";
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import fs from 'fs';
import overrideRaw from '../data/nearestStationOverride.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stations = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'mock/stations.json'), 'utf-8')
);

const overrideMap = overrideRaw?.default || overrideRaw;
const overrideLower = Object.fromEntries(
  Object.entries(overrideMap).map(([k, v]) => [k.toLowerCase(), v])
);

const prettify = new Prettify();

const isProd = process.env.NODE_ENV === 'production';
const devLog = (...args) => {
  if (!isProd) console.log(...args);
};

/** Same as fareJobProcessor — optional CHROME_PATH; omit to let Puppeteer resolve Chrome/Chromium. */
function getPuppeteerLaunchOptions() {
  const launchOpts = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--mute-audio',
    ],
    timeout: 120000,
  };
  const chrome = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (chrome) launchOpts.executablePath = chrome;
  return launchOpts;
}

// ✅ FIX 1: Register StealthPlugin ONCE at module level — never inside a function
puppeteer.use(StealthPlugin());

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeTrainName = (name) =>
  name.toUpperCase().replace(/\s+/g, ' ').replace(/EXPRESS|EXP|MAIL/g, '').trim();

async function getStationCode(cityName) {
  if (typeof cityName !== 'string' || !cityName.trim()) {
    throw new Error('City name must be a non-empty string');
  }
  const city = cityName.toUpperCase().trim();
  const station = stations.find((s) => s.city.toUpperCase() === city);
  if (!station) throw new Error(`No station found for city: ${cityName}`);
  return station.code;
}

const getDay = (date) => dayjs(date).format('ddd');

const decodeRunDays = (binary) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (!binary || typeof binary !== 'string') {
    return days.reduce((acc, day) => { acc[day] = false; return acc; }, {});
  }
  const result = {};
  for (let i = 0; i < binary.length && i < days.length; i++) {
    result[days[i]] = binary[i] === '1';
  }
  return result;
};

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split('.').map(Number);
  return hours * 60 + minutes;
};

const isValidReturnTimeGap = (outTime, returnTime) => {
  const gap = (timeToMinutes(returnTime) - timeToMinutes(outTime) + 1440) % 1440;
  return gap >= 360 && gap <= 420;
};

// ─────────────────────────────────────────────────────────
// Fare extraction
// ─────────────────────────────────────────────────────────

async function extractFareData($, classCode) {
  const fareData = { totalFare: {}, individualFare: {} };

  const processFareTable = (panelSelector, fareObject) => {
    $(`${panelSelector} .tableSingleFare`).each((i, table) => {
      const $table = $(table);
      const headers = $table
        .find('thead th, tr:first-child th')
        .map((i, el) => $(el).text().trim())
        .get()
        .slice(1);
      devLog(`Headers in ${panelSelector}:`, headers);

      if (headers.length < 1) return;

      const validHeaders = classCode ? headers.filter((h) => h === classCode) : headers;
      if (validHeaders.length === 0) return;

      $table.find('tbody tr').each((i, row) => {
        const cols = $(row).find('td').map((i, el) => $(el).text().trim()).get();
        if (cols.length <= 1) return;

        const type = cols[0].toLowerCase().replace(/\s+/g, '_');
        const fareTypes = ['general', 'tatkal', 'adult', 'child', 'adult_tatkal', 'child_tatkal', 'sen_female', 'sen_male'];

        if (fareTypes.includes(type)) {
          const fares = {};
          cols.slice(1).forEach((fare, index) => {
            if (index < headers.length && (!classCode || headers[index] === classCode)) {
              fares[headers[index]] = fare || '-';
            }
          });
          devLog(`Extracted fare for ${type}:`, fares);
          if (Object.keys(fares).length > 0) fareObject[type] = fares;
        }
      });
    });
  };

  processFareTable('.panel-success', fareData.totalFare);
  processFareTable('.panel-warning', fareData.individualFare);
  return fareData;
}

function findPotentialFares($) {
  const result = { totalFare: {}, individualFare: {} };

  $('table').each((i, table) => {
    const $table = $(table);
    const rows = $table.find('tr');
    const hasPotentialFares = $table.text().match(/\b[1-9]\d{0,4}\b/);

    if (hasPotentialFares && rows.length >= 2) {
      const headers = $table.find('th').map((i, el) => $(el).text().trim()).get().slice(1);
      if (headers.some((h) => /\b[1-2][A|E]\b|\b3[A|E]\b|\bSL\b|\bGN\b/.test(h))) {
        $table.find('tr').slice(1).each((i, row) => {
          const cols = $(row).find('td').map((i, el) => $(el).text().trim()).get();
          if (cols.length > 1) {
            const key = cols[0].toLowerCase().replace(/\s+/g, '_');
            const fareTypes = ['general', 'tatkal', 'adult', 'child', 'adult_tatkal', 'child_tatkal', 'sen_female', 'sen_male'];
            if (fareTypes.includes(key)) {
              const fares = {};
              cols.slice(1).forEach((fare, index) => {
                if (index < headers.length) fares[headers[index]] = fare || '-';
              });
              devLog(`Fallback fare for ${key}:`, fares);
              if ($table.closest('.panel-success').length) {
                result.totalFare[key] = fares;
              } else if ($table.closest('.panel-warning').length) {
                result.individualFare[key] = fares;
              }
            }
          }
        });
      }
    }
  });

  return Object.keys(result.totalFare).length || Object.keys(result.individualFare).length ? result : null;
}

// ─────────────────────────────────────────────────────────
// HTTP fare fetch (lightweight, no browser — always tried first)
// ─────────────────────────────────────────────────────────

async function fetchFareViaHttp(trainNo, from, to, classCode = null) {
  try {
    const url = `https://erail.in/train-fare/${trainNo}?from=${from}&to=${to}`;
    devLog(`Fetching HTTP fare for trainNo=${trainNo}, from=${from}, to=${to}, url=${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': new UserAgent().toString(),
        'Accept': 'text/html',
      },
    });

    if (!response.ok) throw new Error(`HTTP request failed: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const fareData = await extractFareData($, classCode);

    if (!Object.keys(fareData.totalFare).length && !Object.keys(fareData.individualFare).length) {
      const fallbackData = findPotentialFares($);
      if (fallbackData) {
        return {
          success: true,
          fare: fallbackData,
          metadata: { note: 'Fares extracted using fallback method (HTTP)', sourceUrl: url, scrapedAt: new Date().toISOString() },
        };
      }
      throw new Error('No fare tables found in HTTP response');
    }

    return {
      success: true,
      fare: fareData,
      metadata: { sourceUrl: url, scrapedAt: new Date().toISOString() },
    };
  } catch (error) {
    devLog(`HTTP fetch failed for trainNo=${trainNo}: ${error.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Puppeteer fare fetch (fallback only when HTTP fails)
// ─────────────────────────────────────────────────────────

async function addFare(trainNo, from, to, classCode = null, browser) {
  // Always try HTTP first — no browser needed, much faster
  const httpFare = await fetchFareViaHttp(trainNo, from, to, classCode);
  if (httpFare?.success) return httpFare;

  // ✅ FIX 2: Guard — if browser wasn't launched, skip gracefully
  if (!browser) {
    devLog(`[SKIP] No browser available for Puppeteer fare fetch of ${trainNo}`);
    return { success: false, fare: null, metadata: { error: 'No browser available' } };
  }

  // ✅ FIX 3: Declare page before try so the catch block can safely reference it
  let page;
  try {
    devLog(`Fetching fare via Puppeteer for trainNo=${trainNo}, from=${from}, to=${to}, classCode=${classCode || 'none'}`);

    const URL_PATTERNS = [
      `https://erail.in/train-fare/${trainNo}?from=${from}&to=${to}`,
      `https://erail.in/train-fare/${trainNo}`,
      `https://erail.in/rail/getTrainFares.aspx?TrainNo=${trainNo}&Station_From=${from}&Station_To=${to}`,
    ];

    page = await browser.newPage();
    await page.setUserAgent(new UserAgent().toString());
    await page.setViewport({ width: 1366, height: 768 });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    let finalHtml = '';
    let lastUrl = '';

    for (const url of URL_PATTERNS) {
      try {
        devLog(`Trying URL: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

        const fareTables = await page.$$('.panel-success .tableSingleFare, .panel-warning .tableSingleFare');
        if (fareTables.length > 0) {
          devLog(`Found ${fareTables.length} fare tables on ${url}`);
          finalHtml = await page.content();
          lastUrl = page.url();
          break;
        }

        const formExists = await page.$('#form1');
        if (formExists) {
          devLog(`Submitting form with from=${from}, to=${to}`);
          await page.evaluate((from, to) => {
            document.querySelector('select[name="from"]').value = from;
            document.querySelector('select[name="to"]').value = to;
            document.querySelector('select[name="adult"]').value = '1';
            document.querySelector('select[name="child"]').value = '0';
            document.querySelector('select[name="sfemale"]').value = '0';
            document.querySelector('select[name="smale"]').value = '0';
            document.querySelector('#form1').submit();
          }, from, to);

          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {
            devLog('No navigation occurred, continuing with current page');
          });

          await page.waitForSelector(
            '.panel-success .tableSingleFare tbody tr td, .panel-warning .tableSingleFare tbody tr td',
            { timeout: 15000 }
          ).catch(() => devLog('Fare selector timeout, continuing'));

          await delay(2000);
        } else {
          devLog(`Form #form1 not found on ${url}, checking for fare tables`);
        }

        finalHtml = await page.content();
        lastUrl = page.url();
        devLog('HTML fetched, length:', finalHtml.length);
        devLog('Final URL after navigation:', lastUrl);

        if (process.env.DEBUG_SCRAPE === '1') {
          fs.writeFileSync(`debug_${trainNo}_${from}_${to}.html`, finalHtml);
        }
        break;
      } catch (err) {
        devLog(`Attempt failed for ${url}: ${err.message}`);
        continue;
      }
    }

    if (!finalHtml) throw new Error('All URL attempts failed');

    const $ = cheerio.load(finalHtml);
    const fareData = await extractFareData($, classCode);

    if (!Object.keys(fareData.totalFare).length && !Object.keys(fareData.individualFare).length) {
      const fallbackData = findPotentialFares($);
      if (fallbackData) {
        // ✅ FIX 5: Always guard page.close()
        if (page) await page.close().catch(() => {});
        return {
          success: true,
          fare: fallbackData,
          metadata: { note: 'Fares extracted using fallback method', sourceUrl: lastUrl, scrapedAt: new Date().toISOString() },
        };
      }
      throw new Error('No fare tables found in HTML');
    }

    // ✅ FIX 5: Always guard page.close()
    if (page) await page.close().catch(() => {});
    return {
      success: true,
      fare: fareData,
      metadata: { sourceUrl: lastUrl, scrapedAt: new Date().toISOString() },
    };

  } catch (error) {
    console.error('Fare fetch error:', error);
    // ✅ FIX 5: page may be undefined if browser.newPage() itself threw — guard it
    if (page) await page.close().catch(() => {});
    return {
      success: false,
      fare: null,
      metadata: {
        error: error.message,
        debugSuggestions: [
          `Verify train number and station codes at https://erail.in/train-fare/${trainNo}`,
          'Check fare table content in logs for correct fares',
        ],
      },
    };
  }
}

// ─────────────────────────────────────────────────────────
// Main controller
// ─────────────────────────────────────────────────────────

const getRoundTripTrains = async (req) => {
  let browser = null;
  try {
    const {
      source,
      destination,
      startDate,
      returnDate,
      classCode = 'SL',
      forceRefresh = false,
      skipFareFetch = false,
    } = req.body;

    if (!source || !destination || !startDate || !returnDate) {
      throw new ApiError(400, 'All fields are required');
    }

    // Resolve source station code
    const fromCode = await getStationCode(source);

    // Resolve destination with nearest-station override fallback
    let toCode;
    const destKey = String(destination || '').trim();
    try {
      toCode = await getStationCode(destKey);
    } catch (err) {
      const candidates =
        overrideMap[destKey] ||
        overrideMap[destKey.toUpperCase?.()] ||
        overrideLower[destKey.toLowerCase?.()];

      if (!Array.isArray(candidates) || candidates.length === 0) {
        devLog('[NEAREST-FALLBACK] No override for', JSON.stringify(destKey),
          'Available keys:', Object.keys(overrideMap));
        throw err;
      }
      toCode = candidates[0];
      devLog(`[NEAREST-FALLBACK] Using nearest-station for "${destKey}": ${toCode}`);
    }

    // Normalize dates
    const normalizedStartDate = new Date(startDate).toISOString().split('T')[0];
    const normalizedReturnDate = new Date(returnDate).toISOString().split('T')[0];
    const isSameDay = normalizedStartDate === normalizedReturnDate;
    const startDay = getDay(startDate);
    const returnDay = getDay(returnDate);

    devLog('Normalized Start Date:', normalizedStartDate);
    devLog('Normalized Return Date:', normalizedReturnDate);
    devLog('Is Same Day:', isSameDay);
    devLog(`Start day: ${startDay}, Return day: ${returnDay}`);

    // Fetch train lists in parallel (HTTP only — browser is only for fare scrape below)
    const fetchTrainData = async (from, to) => {
      const URL_Trains = `https://erail.in/rail/getTrains.aspx?Station_From=${from}&Station_To=${to}&DataSource=0&Language=0&Cache=false`;
      devLog(`Fetching train data for ${from} to ${to}, URL: ${URL_Trains}`);
      const response = await fetch(URL_Trains, {
        method: 'GET',
        headers: { 'User-Agent': new UserAgent().toString() },
      });
      const data = await response.text();
      return prettify.BetweenStation(data);
    };

    const [outTrainData, returnTrainData] = await Promise.all([
      fetchTrainData(fromCode, toCode),
      fetchTrainData(toCode, fromCode),
    ]);

    if (!outTrainData || !returnTrainData) throw new ApiError(404, 'No trains found');

    const outTrains = Array.isArray(outTrainData?.data) ? outTrainData.data : [];
    const returnTrains = Array.isArray(returnTrainData?.data) ? returnTrainData.data : [];

    devLog('Out Trains:', outTrains.length);
    devLog('Return Trains:', returnTrains.length);

    // Filter by running day
    const filteredOutTrains = outTrains
      .filter((train) => {
        const runDays = decodeRunDays(train.train_base?.running_days);
        return runDays[startDay] === true;
      })
      .slice(0, 8);

    const filteredReturnTrains = returnTrains
      .filter((train) => {
        const runDays = decodeRunDays(train.train_base?.running_days);
        return runDays[returnDay] === true;
      })
      .slice(0, 8);

    // Deduplicate return trains by normalized name
    const outTrainNames = new Set(filteredOutTrains.map((t) => normalizeTrainName(t.train_base?.train_name)));
    let filteredReturnTrainsUnique = filteredReturnTrains.filter(
      (t) => !outTrainNames.has(normalizeTrainName(t.train_base?.train_name))
    );

    // Same-day 6-7 hour gap filter
    if (isSameDay && filteredOutTrains.length > 0) {
      const outTimes = filteredOutTrains.map((t) => t.train_base.from_time);
      const gapFiltered = filteredReturnTrainsUnique.filter((t) =>
        outTimes.some((outTime) => isValidReturnTimeGap(outTime, t.train_base.from_time))
      );
      if (gapFiltered.length === 0) {
        devLog('No return trains in 6-7 hr gap; using all available return trains');
        filteredReturnTrainsUnique = filteredReturnTrainsUnique.slice(0, 5);
      } else {
        filteredReturnTrainsUnique = gapFiltered;
      }
    } else {
      filteredReturnTrainsUnique = filteredReturnTrainsUnique.slice(0, 5);
    }

    devLog('Filtered Outbound Trains:', filteredOutTrains.map((t) => ({
      train_no: t.train_base?.train_no,
      train_name: t.train_base?.train_name,
      normalized_name: normalizeTrainName(t.train_base?.train_name),
    })));
    devLog('Filtered Return Trains:', filteredReturnTrainsUnique.map((t) => ({
      train_no: t.train_base?.train_no,
      train_name: t.train_base?.train_name,
      normalized_name: normalizeTrainName(t.train_base?.train_name),
    })));

    const pendingFare = { status: 'pending', success: false };

    if (skipFareFetch) {
      const outTrainsWithFares = filteredOutTrains
        .slice(0, 3)
        .map((t) => ({ ...t, fare: pendingFare }));
      const returnTrainsWithFares = filteredReturnTrainsUnique
        .slice(0, 3)
        .map((t) => ({ ...t, fare: pendingFare }));
      return {
        success: true,
        filteredOutTrains: outTrainsWithFares,
        filteredReturnTrains: returnTrainsWithFares,
        isSameDay,
        fromCode,
        toCode,
        skipFareFetch: true,
      };
    }

    browser = await puppeteer.launch(getPuppeteerLaunchOptions());

    // ✅ FIX 7: Sequential fare fetching instead of Promise.all — prevents browser overload
    const outTrainsWithFares = [];
    for (const train of filteredOutTrains.slice(0, 3)) {
      try {
        const fareData = await addFare(train.train_base?.train_no, fromCode, toCode, classCode, browser);
        devLog(`Fare for outbound train ${train.train_base?.train_no}:`, fareData?.fare);
        outTrainsWithFares.push({ ...train, fare: fareData });
      } catch (err) {
        devLog(`Outbound fare error [${train.train_base?.train_no}]:`, err.message);
        outTrainsWithFares.push({ ...train, fare: null });
      }
      await delay(800);
    }

    const returnTrainsWithFares = [];
    for (const train of filteredReturnTrainsUnique.slice(0, 3)) {
      try {
        const fareData = await addFare(train.train_base?.train_no, toCode, fromCode, classCode, browser);
        devLog(`Fare for return train ${train.train_base?.train_no}:`, fareData?.fare);
        returnTrainsWithFares.push({ ...train, fare: fareData });
      } catch (err) {
        devLog(`Return fare error [${train.train_base?.train_no}]:`, err.message);
        returnTrainsWithFares.push({ ...train, fare: null });
      }
      await delay(800);
    }

    return {
      success: true,
      filteredOutTrains: outTrainsWithFares,
      filteredReturnTrains: returnTrainsWithFares,
      isSameDay,
      fromCode,
      toCode,
      skipFareFetch: false,
    };

  } catch (error) {
    console.error('Error in getRoundTripTrains:', error);
    throw error;
  } finally {
    // ✅ FIX 8: Safe browser close — catches errors so finally never throws
    if (browser) await browser.close().catch((e) => devLog('Browser close error:', e.message));
  }
};

export { getRoundTripTrains, addFare };
