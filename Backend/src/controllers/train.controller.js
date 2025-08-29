import stations from './mock/stations.json' assert { type: "json" };
import dayjs from "dayjs";
import { ApiError } from "../utils/ApiError.js";
import { Prettify } from "../utils/prettify.js";
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import fs from 'fs';
// ADD: nearest-station overrides (destinationCity -> [preferred station codes])
import overrideRaw from '../data/nearestStationOverride.js';
const overrideMap= overrideRaw?.default || overrideRaw; 

const overrideLower = Object.fromEntries(
  Object.entries(overrideMap).map(([k, v]) => [k.toLowerCase(), v])
);

const prettify = new Prettify();

// Helper function to normalize train name for comparison
const normalizeTrainName = (name) => {
  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/EXPRESS|EXP|MAIL/g, '')
    .trim();
};

// Helper function to get station code
async function getStationCode(cityName) {
  if (typeof cityName !== 'string' || !cityName.trim()) {
    throw new Error('City name must be a non-empty string');
  }

  const city = cityName.toUpperCase().trim();
  const station = stations.find((s) => s.city.toUpperCase() === city);

  if (!station) {
    throw new Error(`No station found for city: ${cityName}`);
  }

  return station.code;
}

// Helper function to get day of the week
const getDay = (date) => {
  return dayjs(date).format("ddd");
};

// Helper function to decode run days
const decodeRunDays = (binary) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const result = {};
  console.log("Decoding run days for binary:", binary);
  if (!binary || typeof binary !== 'string') {
    return days.reduce((acc, day) => {
      acc[day] = false;
      return acc;
    }, {});
  }
  for (let i = 0; i < binary.length && i < days.length; i++) {
    result[days[i]] = binary[i] === "1";
  }
  console.log("Decoded run days:", result);
  return result;
};

// Helper function to convert time string (HH.MM) to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split('.').map(Number);
  return hours * 60 + minutes;
};

// Helper function to check if return time is 6-7 hours after outbound time
const isValidReturnTimeGap = (outTime, returnTime) => {
  const outMinutes = timeToMinutes(outTime);
  const returnMinutes = timeToMinutes(returnTime);
  const gapMinutes = (returnMinutes - outMinutes + 1440) % 1440; // Handle day wrap-around
  return gapMinutes >= 360 && gapMinutes <= 420; // 6-7 hours in minutes
};

// Helper function to extract fare data
async function extractFareData($, classCode) {
  const fareData = {
    totalFare: {},
    individualFare: {},
  };

  const processFareTable = (panelSelector, fareObject) => {
    $(`${panelSelector} .tableSingleFare`).each((i, table) => {
      const $table = $(table);
      const headers = $table
        .find('thead th, tr:first-child th')
        .map((i, el) => $(el).text().trim())
        .get()
        .slice(1);
      console.log(`Headers in ${panelSelector}:`, headers);

      if (headers.length < 1) return;

      const validHeaders = classCode ? headers.filter((h) => h === classCode) : headers;
      if (validHeaders.length === 0) return;

      $table.find('tbody tr').each((i, row) => {
        const $row = $(row);
        const cols = $row.find('td').map((i, el) => $(el).text().trim()).get();
        if (cols.length <= 1) return;

        const type = cols[0].toLowerCase().replace(/\s+/g, '_');
        const fareTypes = [
          'general',
          'tatkal',
          'adult',
          'child',
          'adult_tatkal',
          'child_tatkal',
          'sen_female',
          'sen_male',
        ];

        if (fareTypes.includes(type)) {
          const fares = {};
          cols.slice(1).forEach((fare, index) => {
            if (index < headers.length && (!classCode || headers[index] === classCode)) {
              fares[headers[index]] = fare || '-';
            }
          });
          console.log(`Extracted fare for ${type}:`, fares);
          if (Object.keys(fares).length > 0) {
            fareObject[type] = fares;
          }
        }
      });
    });
  };

  processFareTable('.panel-success', fareData.totalFare);
  processFareTable('.panel-warning', fareData.individualFare);

  return fareData;
}

// Helper function to find potential fares
function findPotentialFares($) {
  const result = {
    totalFare: {},
    individualFare: {},
  };

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
            const fareTypes = [
              'general',
              'tatkal',
              'adult',
              'child',
              'adult_tatkal',
              'child_tatkal',
              'sen_female',
              'sen_male',
            ];
            if (fareTypes.includes(key)) {
              const fares = {};
              cols.slice(1).forEach((fare, index) => {
                if (index < headers.length) {
                  fares[headers[index]] = fare || '-';
                }
              });
              console.log(`Fallback fare for ${key}:`, fares);
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

// Helper function to fetch fare via lightweight HTTP client
async function fetchFareViaHttp(trainNo, from, to, classCode = null) {
  try {
    const url = `https://erail.in/train-fare/${trainNo}?from=${from}&to=${to}`;
    console.log(`Fetching HTTP fare for trainNo=${trainNo}, from=${from}, to=${to}, url=${url}`);
    const userAgent = new UserAgent();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent.toString(),
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const fareData = await extractFareData($, classCode);

    if (!Object.keys(fareData.totalFare).length && !Object.keys(fareData.individualFare).length) {
      const fallbackData = findPotentialFares($);
      if (fallbackData) {
        return {
          success: true,
          fare: fallbackData,
          metadata: {
            note: 'Fares extracted using fallback method (HTTP)',
            sourceUrl: url,
            scrapedAt: new Date().toISOString(),
          },
        };
      }
      throw new Error('No fare tables found in HTTP response');
    }

    return {
      success: true,
      fare: fareData,
      metadata: {
        sourceUrl: url,
        scrapedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.log(`HTTP fetch failed for trainNo=${trainNo}: ${error.message}`);
    return null;
  }
}

// Helper function to fetch fare for a single train
async function addFare(trainNo, from, to, classCode = null, browser) {
  const httpFare = await fetchFareViaHttp(trainNo, from, to, classCode);
  if (httpFare && httpFare.success) {
    return httpFare;
  }

  let page;
  try {
    console.log(`Fetching fare via Puppeteer for trainNo=${trainNo}, from=${from}, to=${to}, classCode=${classCode || 'none'}`);

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
        console.log(`Trying URL: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

        const fareTables = await page.$$('.panel-success .tableSingleFare, .panel-warning .tableSingleFare');
        if (fareTables.length > 0) {
          console.log(`Found ${fareTables.length} fare tables on ${url}`);
          finalHtml = await page.content();
          lastUrl = page.url();
          break;
        }

        const formExists = await page.$('#form1');
        if (formExists) {
          console.log(`Submitting form with from=${from}, to=${to}, adult=1, child=0, sfemale=0, smale=0`);
          await page.evaluate((from, to) => {
            console.log(`Setting form: from=${from}, to=${to}`);
            document.querySelector('select[name="from"]').value = from;
            document.querySelector('select[name="to"]').value = to;
            document.querySelector('select[name="adult"]').value = '1';
            document.querySelector('select[name="child"]').value = '0';
            document.querySelector('select[name="sfemale"]').value = '0';
            document.querySelector('select[name="smale"]').value = '0';
            document.querySelector('#form1').submit();
          }, from, to);

          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {
            console.log('No navigation occurred, continuing with current page');
          });

          await page.waitForSelector('.panel-success .tableSingleFare tbody tr td, .panel-warning .tableSingleFare tbody tr td', {
            timeout: 15000,
          });

          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.log(`Form #form1 not found on ${url}, checking for fare tables`);
        }

        finalHtml = await page.content();
        lastUrl = page.url();
        console.log('HTML fetched, length:', finalHtml.length);
        console.log('Final URL after navigation:', lastUrl);

        fs.writeFileSync(`debug_${trainNo}_${from}_${to}.html`, finalHtml);
        break;
      } catch (err) {
        console.log(`Attempt failed for ${url}: ${err.message}`);
        continue;
      }
    }

    if (!finalHtml) {
      throw new Error('All URL attempts failed');
    }

    const $ = cheerio.load(finalHtml);
    const fareData = await extractFareData($, classCode);

    if (!Object.keys(fareData.totalFare).length && !Object.keys(fareData.individualFare).length) {
      const fallbackData = findPotentialFares($);
      if (fallbackData) {
        await page.close();
        return {
          success: true,
          fare: fallbackData,
          metadata: {
            note: 'Fares extracted using fallback method',
            sourceUrl: lastUrl,
            scrapedAt: new Date().toISOString(),
          },
        };
      }
      throw new Error('No fare tables found in HTML');
    }

    await page.close();
    return {
      success: true,
      fare: fareData,
      metadata: {
        sourceUrl: lastUrl,
        scrapedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Fare fetch error:', error);
    await page.close().catch(() => {});
    return {
      success: false,
      fare: null,
      metadata: {
        error: error.message,
        debugSuggestions: [
          `Check debug HTML file (debug_${trainNo}_${from}_${to}.html) for table structure`,
          `Verify train number and station codes at https://erail.in/train-fare/${trainNo}`,
          'Check fare table content in logs for correct fares',
          'Increase delay if fares are not updated in DOM',
        ],
      },
    };
  }
}

// Main controller
const getRoundTripTrains = async (req) => {
  let browser = null;
  try {
    const { source, destination, startDate, returnDate, classCode = 'SL', forceRefresh = false } = req.body;

    if (!source || !destination || !startDate || !returnDate) {
      throw new ApiError(400, "All fields are required");
    }

    const fromCode = await getStationCode(source);
  let toCode;
const destKey = String(destination || '').trim();

try {
  // Try normal city -> station code first
  toCode = await getStationCode(destKey);
} catch (err) {
  // Case-insensitive override lookup
  const candidates =
    overrideMap[destKey] ||
    overrideMap[destKey.toUpperCase?.()] ||
    overrideLower[destKey.toLowerCase?.()];

  if (!Array.isArray(candidates) || candidates.length === 0) {
    console.log('[NEAREST-FALLBACK] No override for', JSON.stringify(destKey),
                'Available keys:', Object.keys(overrideMap));
    // Preserve your original behavior if we truly have no override
    throw err;
  }

  toCode = candidates[0];
  console.log(`[NEAREST-FALLBACK] Using nearest-station for "${destKey}": ${toCode}`);
}



    // const toCode = await getStationCode(destination);

    // Normalize and validate dates
    const normalizedStartDate = new Date(startDate).toISOString().split('T')[0];
    const normalizedReturnDate = new Date(returnDate).toISOString().split('T')[0];
    const isSameDay = normalizedStartDate === normalizedReturnDate;
    console.log("Normalized Start Date:", normalizedStartDate);
    console.log("Normalized Return Date:", normalizedReturnDate);
    console.log("Is Same Day:", isSameDay);

    const startDay = getDay(startDate);
    const returnDay = getDay(returnDate);
    console.log(`Start day: ${startDay}, Return day: ${returnDay}`);

    puppeteer.use(StealthPlugin());
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000,
    });

    const fetchTrainData = async (from, to) => {
      const URL_Trains = `https://erail.in/rail/getTrains.aspx?Station_From=${from}&Station_To=${to}&DataSource=0&Language=0&Cache=false`;
      console.log(`Fetching train data for ${from} to ${to}, URL: ${URL_Trains}`);
      const userAgent = new UserAgent();
      const response = await fetch(URL_Trains, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent.toString(),
        },
      });

      const data = await response.text();
      return prettify.BetweenStation(data);
    };

    const [outTrainData, returnTrainData] = await Promise.all([
      fetchTrainData(fromCode, toCode),
      fetchTrainData(toCode, fromCode),
    ]);

    if (!outTrainData || !returnTrainData) {
      throw new ApiError(404, "No trains found");
    }

    // const outTrains = outTrainData.data || [];
    // const returnTrains = returnTrainData.data || [];
    const outTrains = Array.isArray(outTrainData?.data) ? outTrainData.data : [];
const returnTrains = Array.isArray(returnTrainData?.data) ? returnTrainData.data : [];

    console.log("Out Trains:", outTrains.length);
    console.log("Return Trains:", returnTrains.length);

    const filteredOutTrains = outTrains.filter(train => {
      const runDays = decodeRunDays(train.train_base?.running_days);
      return runDays[startDay] === true;
    }).slice(0, 8); // Increased to 5 for more options

    const filteredReturnTrains = returnTrains.filter(train => {
      const runDays = decodeRunDays(train.train_base?.running_days);
      return runDays[returnDay] === true;
    }).slice(0, 8); // Increased to 8 for more options

    // Deduplicate return trains based on normalized train name
    const outTrainNames = new Set(filteredOutTrains.map(train => normalizeTrainName(train.train_base?.train_name)));

    // Apply 6-7 hour gap filter if same day
    let filteredReturnTrainsUnique = filteredReturnTrains.filter(
      train => !outTrainNames.has(normalizeTrainName(train.train_base?.train_name))
    );
    if (isSameDay && filteredOutTrains.length > 0) {
      const outTimes = filteredOutTrains.map(train => train.train_base.from_time);
      filteredReturnTrainsUnique = filteredReturnTrainsUnique.filter(train => {
        const returnTime = train.train_base.from_time;
        return outTimes.some(outTime => isValidReturnTimeGap(outTime, returnTime));
      });
      if (filteredReturnTrainsUnique.length === 0) {
        console.log("No return trains found within 6-7 hour gap, using all available return trains");
        filteredReturnTrainsUnique = filteredReturnTrains.filter(
          train => !outTrainNames.has(normalizeTrainName(train.train_base?.train_name))
        ).slice(0, 5);
      }
    } else {
      filteredReturnTrainsUnique = filteredReturnTrainsUnique.slice(0, 5);
    }

    console.log("Filtered Outbound Trains:", filteredOutTrains.map(t => ({
      train_no: t.train_base?.train_no,
      train_name: t.train_base?.train_name,
      normalized_name: normalizeTrainName(t.train_base?.train_name)
    })));
    console.log("Filtered Return Trains:", filteredReturnTrainsUnique.map(t => ({
      train_no: t.train_base?.train_no,
      train_name: t.train_base?.train_name,
      normalized_name: normalizeTrainName(t.train_base?.train_name)
    })));

    const outTrainsWithFares = await Promise.all(
      filteredOutTrains.map(async (train) => {
        const fareData = await addFare(train.train_base?.train_no, fromCode, toCode, classCode, browser);
        console.log(`Fare for outbound train ${train.train_base?.train_no}:`, fareData?.fare);
        return { ...train, fare: fareData };
      })
    );

    const returnTrainsWithFares = await Promise.all(
      filteredReturnTrainsUnique.map(async (train) => {
        const fareData = await addFare(train.train_base?.train_no, toCode, fromCode, classCode, browser);
        console.log(`Fare for return train ${train.train_base?.train_no}:`, fareData?.fare);
        return { ...train, fare: fareData };
      })
    );

    return {
      success: true,
      filteredOutTrains: outTrainsWithFares,
      filteredReturnTrains: returnTrainsWithFares,
      isSameDay: isSameDay,
    };
  } catch (error) {
    console.error("Error in getRoundTripTrains:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

export { getRoundTripTrains };