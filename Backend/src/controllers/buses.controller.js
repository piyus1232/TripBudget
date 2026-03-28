import * as cheerio from 'cheerio';
import { ApiError } from '../utils/ApiError.js';
import { Prettify } from '../utils/prettify.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import dayjs from 'dayjs';
import fs from 'fs';

// Apply StealthPlugin to avoid bot detection
puppeteer.use(StealthPlugin());

// Helper function to replace waitForTimeout
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Static HTML content (for testing or fallback)
const htmlContent = `
<div id="bus-searchresults-app">
  <div id="main-content" class="clearfix col center">
    <div id="hiddenVarBox" class="hideMe">
      <input type="hidden" name="source1" value="Jaipur">
      <input type="hidden" name="destination1" value="Manali">
      <input type="hidden" name="jdate1" value="2025-09-17">
    </div>
    <div id="stick">
      <div id="main-content-header" class="clearfix">
        <div id="journery-details-short">
          <div class="clearfix firsthead">
            <span id="fromTo">
              <span style="font-size: 18px;">Jaipur</span>
              <h1 style="width: 10px;display: inline;">→</h1>
              <span style="font-size: 18px;">Manali</span><br>
              <span class="arrDepDetails"> Onward : 
                <span>Wed, 17-Sep-2025</span>
              </span> 
              <span id="countBox" class="status-count-item">
                <span>3</span>
                Buses (<span>101</span> Seats available)
              </span>  
            </span>
          </div>
        </div>
      </div>
      <div class="mainfiltercontainer">
        <div id="filterHeader2" class="clearfix">
          <div id="price-filter" class="slider-box">
            <span class="startValue"><span class="curr"></span>&nbsp;<span class="startFareValue">1299</span></span>
            <span class="endValue"><span class="curr"></span>&nbsp;<span class="endFareValue">2099</span></span>
          </div>
          <div id="deptime-filter" class="slider-box">
            <span class="startValue"><span>14:20</span></span>
            <span class="endValue">&nbsp;&nbsp;&nbsp;&nbsp;<span>17:00</span></span>
          </div>
          <div id="busOperator-filter" class="ckbx-box">
            <div class="sidebox-content minmaxed">
              <ul>
                <li><span class="dataDisplayDom" title="Hari Das Tour &amp;Travels">Hari Das Tour &amp;Trave...</span><span class="dataStorageDom">Hari Das Tour &amp;Travels</span></li>
                <li><span class="dataDisplayDom" title="Ram Dalal Holidays Pvt Ltd">Ram Dalal Holidays P...</span><span class="dataStorageDom">Ram Dalal Holidays Pvt Ltd</span></li>
              </ul>
            </div>
          </div>
          <div id="bustype-filter" class="ckbx-box">
            <div class="sidebox-content minmaxed">
              <ul>
                <li><span class="dataDisplayDom" title="">A/C Seater [Volvo, Multi..]</span><span class="dataStorageDom">A/C Seater</span></li>
              </ul>
            </div>
          </div>
          <div id="boardpt-filter" class="ckbx-box">
            <div class="sidebox-content minmaxed">
              <ul>
                <li><span class="dataDisplayDom" title="14 Number By Pass Sikar Road Jaipur">14 Number By Pass Si...</span><span class="dataStorageDom">14 Number By Pass Sikar Road Jaipur</span></li>
                <li><span class="dataDisplayDom" title="">14 Number Pulia Vki</span><span class="dataStorageDom">14 Number Pulia Vki</span></li>
                <li><span class="dataDisplayDom" title="">Alaka Cinema Jaipur</span><span class="dataStorageDom">Alaka Cinema Jaipur</span></li>
                <li><span class="dataDisplayDom" title="Amity University Delhi Road">Amity University Del...</span><span class="dataStorageDom">Amity University Delhi Road</span></li>
                <li><span class="dataDisplayDom" title="">Chomu Pulia</span><span class="dataStorageDom">Chomu Pulia</span></li>
                <li><span class="dataDisplayDom" title="">Jaipur</span><span class="dataStorageDom">Jaipur</span></li>
                <li><span class="dataDisplayDom" title="">Niims</span><span class="dataStorageDom">Niims</span></li>
                <li><span class="dataDisplayDom" title="">Sindhi Camp</span><span class="dataStorageDom">Sindhi Camp</span></li>
                <li><span class="dataDisplayDom" title="Sindhi Camp Hari Das Travels Office">Sindhi Camp Hari Das...</span><span class="dataStorageDom">Sindhi Camp Hari Das Travels Office</span></li>
              </ul>
            </div>
          </div>
          <div id="droppt-filter" class="ckbx-box">
            <div class="sidebox-content minmaxed">
              <ul>
                <li><span class="dataDisplayDom" title="">Manali</span><span class="dataStorageDom">Manali</span></li>
                <li><span class="dataDisplayDom" title="Royal Rajasthan Regency">Royal Rajasthan Rege...</span><span class="dataStorageDom">Royal Rajasthan Regency</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div id="lb-tab" class="lb-tab clearfix">
        <ul id="tab-ct" class="clearfix">
          <li class="tab-content tab-item1 clearfix">
            <div id="displayBuses">
              <div class="vailableBusesRS">
                <section id="serviceid-5001895353738123042-1-5001895300008123042-false">
                  <div class="currentBus col-md-12" id="serviceid-5001895353738123042-1-5001895300008123042-false">
                    <div>
                      <div class="col-md-4 clearFloat"><b>Ram Dalal Holidays Pvt Ltd</b><p style="line-height: 20px;">Volvo 9600 A/C Semi Sleeper (2+2)..</p></div>
                      <div class="col-md-2 depArrTimeCell depCell modilehide"><div class="departures">03:15 PM<p class="underLine">Pickups</p></div></div>
                      <div class="col-md-2 depArrTimeCell arrCell modilehide"><div class="arrivals">06:30 AM<p class="underLine">Dropoffs</p></div></div>
                      <div class="col-md-1 modilehide"><span class="unDiscountedFare"><span class="curr"></span>&nbsp;2099<label style="display:none;">2099</label></span></div>
                      <div class="col-md-1 mobiSearchBtn"><a href="#" id="5001895353738123042" class="form-control btnn5001895353738123042 bookSeatBtn closeBtn1 notOkayToClickNo">29 seats</a></div>
                    </div>
                  </div>
                </section>
                <section id="serviceid-5001895353738893699-1-5001895300008893699-false">
                  <div class="currentBus col-md-12" id="serviceid-5001895353738893699-1-5001895300008893699-false">
                    <div>
                      <div class="col-md-4 clearFloat"><b>Hari Das Tour &amp;Travels</b><p style="line-height: 20px;">VE A/C Seater (2+2)..</p></div>
                      <div class="col-md-2 depArrTimeCell depCell modilehide"><div class="departures">02:20 PM<p class="underLine">Pickups</p></div></div>
                      <div class="col-md-2 depArrTimeCell arrCell modilehide"><div class="arrivals">05:00 AM<p class="underLine">Dropoffs</p></div></div>
                      <div class="col-md-1 modilehide"><span class="unDiscountedFare"><span class="curr"></span>&nbsp;1299<label style="display:none;">1299</label></span></div>
                      <div class="col-md-1 mobiSearchBtn"><a href="#" id="5001895353738893699" class="form-control btnn5001895353738893699 bookSeatBtn closeBtn1 notOkayToClickNo">37 seats</a></div>
                    </div>
                  </div>
                </section>
                <section id="serviceid-5001895353738911260-1-5001895300008911260-false">
                  <div class="currentBus col-md-12" id="serviceid-5001895353738911260-1-5001895300008911260-false">
                    <div>
                      <div class="col-md-4 clearFloat"><b>Hari Das Tour &amp;Travels</b><p style="line-height: 20px;">VE A/C Seater (2+2)..</p></div>
                      <div class="col-md-2 depArrTimeCell depCell modilehide"><div class="departures">05:00 PM<p class="underLine">Pickups</p></div></div>
                      <div class="col-md-2 depArrTimeCell arrCell modilehide"><div class="arrivals">08:00 AM<p class="underLine">Dropoffs</p></div></div>
                      <div class="col-md-1 modilehide"><span class="unDiscountedFare"><span class="curr"></span>&nbsp;1399<label style="display:none;">1399</label></span></div>
                      <div class="col-md-1 mobiSearchBtn"><a href="#" id="5001895353738911260" class="form-control btnn5001895353738911260 bookSeatBtn closeBtn1 notOkayToClickNo">35 seats</a></div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="discountPopUp">
      <div>
        <p style="color: red; font-size: 16px; font-weight: bold; text-align: center">Upto Rs 200 Instant Discount</p>
        <p style="text-align: center;font-size: 12px;">Use coupon code: <strong>ETSBUS</strong></p>
      </div>
    </div>
  </div>
</div>
`;

// Validate input parameters
const validateInput = (source, destination, travelDate, searchId) => {
  if (!source || typeof source !== 'string' || !source.trim()) {
    throw new ApiError(400, 'Source city must be a non-empty string');
  }
  if (!destination || typeof destination !== 'string' || !destination.trim()) {
    throw new ApiError(400, 'Destination city must be a non-empty string');
  }
  const date = new Date(travelDate);
  if (!travelDate || isNaN(date) || !dayjs(travelDate).isValid()) {
    throw new ApiError(400, 'Travel date must be a valid date (YYYY-MM-DD)');
  }
  if (dayjs(date).isBefore(dayjs(), 'day')) {
    throw new ApiError(400, 'Travel date cannot be in the past');
  }
  if (searchId && (typeof searchId !== 'string' || !searchId.trim())) {
    throw new ApiError(400, 'Search ID must be a non-empty string if provided');
  }
};
const normalizeDate = (travelDate) => {
  return dayjs(travelDate).format('YYYY-MM-DD');
};

// Normalize travel date to DD-MM-YYYY for form input
const normalizeDateForForm = (travelDate) => {
  return dayjs(travelDate).format('DD-MM-YYYY');
};

// Extract filter options from HTML
const extractFilters = ($) => {
  const filters = {
    priceRange: {
      min: $('.startFareValue').first().text().trim() || 'N/A',
      max: $('.endFareValue').first().text().trim() || 'N/A',
    },
    departureTimeRange: {
      start: $('#deptime-filter .startValue span').first().text().trim() || 'N/A',
      end: $('#deptime-filter .endValue span').last().text().trim() || 'N/A',
    },
    busOperators: [],
    busTypes: [],
    boardingPoints: [],
    droppingPoints: [],
  };

  $('#busOperator-filter .sidebox-content ul li').each((i, el) => {
    const operator = $(el).find('.dataDisplayDom').text().trim();
    if (operator) filters.busOperators.push(operator);
  });
  $('#bustype-filter .sidebox-content ul li').each((i, el) => {
    const busType = $(el).find('.dataDisplayDom').text().trim();
    if (busType) filters.busTypes.push(busType);
  });
  $('#boardpt-filter .sidebox-content ul li').each((i, el) => {
    const point = $(el).find('.dataDisplayDom').text().trim();
    if (point) filters.boardingPoints.push(point);
  });
  $('#droppt-filter .sidebox-content ul li').each((i, el) => {
    const point = $(el).find('.dataDisplayDom').text().trim();
    if (point) filters.droppingPoints.push(point);
  });

  return filters;
};

// Extract discount offer from HTML
const extractDiscountOffer = ($) => {
  const offerText = $('.discountPopUp p').first().text().trim() || 'No discount available';
  const coupon = $('.discountPopUp strong').text().trim() || 'N/A';
  return `${offerText} - Coupon: ${coupon}`;
};

// Extract journey details from page header
const extractJourneyDetails = ($, source, destination, travelDate) => {
  const from =
    $('#hiddenVarBox input[name="source1"]').val()?.trim() ||
    $('#fromTo span').first().text().trim() ||
    source;
  const to =
    $('#hiddenVarBox input[name="destination1"]').val()?.trim() ||
    $('#fromTo span').eq(2).text().trim() ||
    destination;
  const dateTextDom = $('#fromTo .arrDepDetails span').first().text().trim();
  const dateHidden = $('#hiddenVarBox input[name="jdate1"]').val()?.trim();
  const date = dateHidden || dateTextDom || travelDate;
  const busCount = $('#countBox span').first().text().trim() || '0';
  const seatsAvailable = $('#countBox span').eq(1).text().trim() || '0';

  return {
    from,
    to,
    date,
    busCount,
    seatsAvailable,
  };
};

// Extract bus results from HTML
const extractBusResults = ($) => {
  const buses = [];
  const selectors = [
    '.vailableBusesRS section',
    '#displayBuses .currentBus',
    '[class*="bus-item"], [class*="bus-card"], [class*="bus-result"]',
  ];

  for (const selector of selectors) {
    $(selector).each((_, section) => {
      const $sec = $(section);
      const secId = $sec.attr('id') || '';

      const operator = $sec.find('.col-md-4 b, [class*="operator"], [class*="travels"]').first().text().trim();
      const busType = $sec.find('.col-md-4 p, [class*="bus-type"]').first().text().trim();

      const departure = $sec
        .find('.departures, [class*="departure"], [class*="dep-time"]')
        .first()
        .contents()
        .filter((i, el) => el.type === 'text')
        .text()
        .trim();
      const arrival = $sec
        .find('.arrivals, [class*="arrival"], [class*="arr-time"]')
        .first()
        .contents()
        .filter((i, el) => el.type === 'text')
        .text()
        .trim();

      const fareLabel = $sec.find('.unDiscountedFare label, [class*="fare"]').first().text().trim();
      const fareText = $sec.find('.unDiscountedFare, [class*="fare"]').first().text().replace(/\D+/g, '');
      const fare = fareLabel || fareText || null;

      const seatText = $sec.find('.mobiSearchBtn a, [class*="seats"]').first().text().trim();
      const seats = (seatText.match(/\d+/)?.[0]) || null;

      const serviceId = $sec.find('.mobiSearchBtn a, [class*="service-id"]').attr('id') || secId;

      if (operator && busType && departure && arrival && fare && seats) {
        buses.push({
          serviceId,
          operator,
          busType,
          departureTime: departure,
          arrivalTime: arrival,
          fare: fare ? Number(fare) : null,
          seatsAvailable: seats ? Number(seats) : null,
        });
      }
    });
    if (buses.length > 0) break; // Exit loop if buses are found
  }

  return buses;
};

// Scrape static HTML data
const scrapeStaticData = (source, destination, travelDate) => {
  try {
    const $ = cheerio.load(htmlContent);
    const journeyDetails = extractJourneyDetails($, source, destination, travelDate);
    const buses = extractBusResults($);
    const filters = extractFilters($);
    const discountOffer = extractDiscountOffer($);

    // Validate static data
    const staticSource = $('input[name="source1"]').val()?.toLowerCase();
    const staticDestination = $('input[name="destination1"]').val()?.toLowerCase();
    const staticDate = $('input[name="jdate1"]').val();

    if (
      source.toLowerCase() !== staticSource ||
      destination.toLowerCase() !== staticDestination ||
      travelDate !== staticDate
    ) {
      throw new ApiError(400, 'Static HTML data does not match requested route or date');
    }

    return {
      success: true,
      data: {
        journeyDetails,
        buses,
        filters,
        discountOffer,
      },
      metadata: {
        source: 'Static HTML',
        scrapedAt: new Date().toISOString(),
        cacheUsed: true,
      },
    };
  } catch (error) {
    console.error('Error in scrapeStaticData:', error);
    return {
      success: false,
      data: null,
      metadata: {
        error: error.message,
        debugSuggestions: [
          'Verify HTML structure and selectors',
          `Ensure input matches static HTML data (Jaipur to Manali, 2025-09-17)`,
          'Check for missing elements in HTML',
        ],
      },
    };
  }
};

// Scrape dynamic data using Puppeteer
const scrapeDynamicData = async (source, destination, travelDate, searchId) => {
  let browser, page;
  const maxRetries = 3;
  const baseUrl = 'https://www.etravelsmart.com/bus/';
  const searchUrl = searchId
    ? `${baseUrl}results.htm?searchId=${encodeURIComponent(searchId)}`
    : baseUrl; // Go to the search page

  const networkRequests = [];
  let debugFile = null;
  let screenshot = null;
  let preSubmitScreenshot = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to scrape ${searchUrl}`);
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--lang=en-US,en',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
        timeout: 60000,
      });

      page = await browser.newPage();
      await page.setUserAgent(new UserAgent({ deviceCategory: 'desktop' }).toString());
      await page.setViewport({ width: 1366, height: 900 });

      // Capture network requests for debugging
      page.on('requestfinished', async (req) => {
        try {
          const res = await req.response();
          const ct = res.headers()['content-type'] || '';
          if (ct.includes('application/json')) {
            try {
              const json = await res.json();
              networkRequests.push({
                url: req.url(),
                status: res.status(),
                type: req.resourceType(),
                data: json,
              });
            } catch {}
          }
        } catch {}
      });

      // Navigate to the search page
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 90000 });

      // Handle cookie banners/popups
      await page.evaluate(() => {
        const selectors = [
          '#cookie-close',
          '.cookie-close',
          '.close',
          '.btn-accept',
          '.btn-okay',
          '[class*="accept"], [id*="accept"]',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) el.click();
        }
      }).catch(() => console.log('No cookie banner found'));

      // Fill and submit the search form if no searchId is provided
      if (!searchId) {
        console.log('Filling search form');
        // Wait for form container to ensure dynamic loading
        await page.waitForSelector('#bus-search-form, .search-form, form[action*="bus/results"]', { timeout: 10000 }).catch(() =>
          console.log('Form container not found')
        );

        // Define precise selectors (to be updated based on manual inspection)
        const sourceSelector = 'input[id="sourceCity"], input[name="sourceCity"], #source, [name="fromCity"]';
        const destinationSelector = 'input[id="destinationCity"], input[name="destinationCity"], #destination, [name="toCity"]';
        const dateSelector = 'input[id="doj"], input[name="doj"], #journeyDate, [name="travelDate"]';
        const searchButtonSelector = 'button[id="searchBuses"], button[type="submit"], .search-btn, #btnSearch';

        try {
          await page.waitForSelector(sourceSelector, { timeout: 10000 });
        } catch (err) {
          throw new Error(`Source field not found with selector: ${sourceSelector}`);
        }

        // Simulate human input for source
        await page.focus(sourceSelector);
        await page.keyboard.type(source, { delay: 100 }); // 100ms delay between keystrokes
        await delay(1000); // Wait for autocomplete
        await page.waitForFunction(
          () => document.querySelectorAll('.autocomplete-suggestion, .suggestion-item, .ui-menu-item, [class*="suggestion"]').length > 0,
          { timeout: 2000 }
        ).catch(() => console.log('No autocomplete suggestions found'));
        const sourceSuggestions = await page.evaluate((source) => {
          return Array.from(document.querySelectorAll('.autocomplete-suggestion, .suggestion-item, .ui-menu-item, [class*="suggestion"]'))
            .map((el) => el.getAttribute('data-value') || el.textContent.trim())
            .filter((val) => val && val.toLowerCase().includes(source.toLowerCase()));
        }, source);
        console.log('Source autocomplete suggestions:', sourceSuggestions);
        if (sourceSuggestions.length > 0) {
          await page.evaluate((source) => {
            const suggestion = Array.from(document.querySelectorAll('.autocomplete-suggestion, .suggestion-item, .ui-menu-item, [class*="suggestion"]')).find(
              (el) => (el.getAttribute('data-value') || el.textContent.trim()).toLowerCase().includes(source.toLowerCase())
            );
            if (suggestion) suggestion.click();
          }, source);
        } else {
          console.log('No valid source suggestion to select');
        }

        // Simulate human input for destination
        await page.focus(destinationSelector);
        await page.keyboard.type(destination, { delay: 100 });
        await delay(1000); // Wait for autocomplete
        await page.waitForFunction(
          () => document.querySelectorAll('.autocomplete-suggestion, .suggestion-item, .ui-menu-item, [class*="suggestion"]').length > 0,
          { timeout: 2000 }
        ).catch(() => console.log('No autocomplete suggestions found'));
        const destinationSuggestions = await page.evaluate((destination) => {
          return Array.from(document.querySelectorAll('.autocomplete-suggestion, .suggestion-item, .ui-menu-item, [class*="suggestion"]'))
            .map((el) => el.getAttribute('data-value') || el.textContent.trim())
            .filter((val) => val && val.toLowerCase().includes(destination.toLowerCase()));
        }, destination);
        console.log('Destination autocomplete suggestions:', destinationSuggestions);
        if (destinationSuggestions.length > 0) {
          await page.evaluate((destination) => {
            const suggestion = Array.from(document.querySelectorAll('.autocomplete-suggestion, .suggestion-item, .ui-menu-item, [class*="suggestion"]')).find(
              (el) => (el.getAttribute('data-value') || el.textContent.trim()).toLowerCase().includes(destination.toLowerCase())
            );
            if (suggestion) suggestion.click();
          }, destination);
        } else {
          console.log('No valid destination suggestion to select');
        }

        // Type date
        await page.focus(dateSelector);
        const formattedDate = normalizeDateForForm(travelDate);
        await page.keyboard.type(formattedDate, { delay: 100 });
        await delay(500);

        // Log form values for debugging
        const formValues = await page.evaluate(
          (sourceSel, destSel, dateSel) => {
            const source = document.querySelector(sourceSel)?.value || '';
            const destination = document.querySelector(destSel)?.value || '';
            const date = document.querySelector(dateSel)?.value || '';
            return { source, destination, date };
          },
          sourceSelector,
          destinationSelector,
          dateSelector
        );
        console.log('Form values:', formValues);

        // Save screenshot after filling form
        preSubmitScreenshot = `debug_screenshot_${source}_${destination}_${travelDate}_${attempt}_pre_submit.png`;
        await page.screenshot({ path: preSubmitScreenshot, fullPage: true });
        console.log('Pre-submit screenshot saved:', preSubmitScreenshot);

        // Log full form HTML for debugging
        const formHtml = await page.evaluate((sourceSel, destSel, dateSel) => {
          const sourceEl = document.querySelector(sourceSel);
          const destEl = document.querySelector(destSel);
          const dateEl = document.querySelector(dateSel);
          return sourceEl ? sourceEl.outerHTML + destEl.outerHTML + dateEl.outerHTML : 'Form elements not found';
        }, sourceSelector, destinationSelector, dateSelector);
        console.log('Form HTML:', formHtml);

        // Click the search button
        try {
          await page.waitForSelector(searchButtonSelector, { timeout: 5000 });
          await page.evaluate((sel) => {
            const searchButton = document.querySelector(sel);
            if (searchButton) searchButton.click();
          }, searchButtonSelector);
        } catch (err) {
          console.log('No search button found with selector:', searchButtonSelector);
        }

        // Wait for navigation or results to load
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => console.log('No navigation after form submission'));
      }

      // Wait for bus results or error messages
      const hasResults = await page.waitForFunction(() => {
        const q = (s) => document.querySelectorAll(s).length;
        return (
          q('#displayBuses .currentBus') > 0 ||
          q('.vailableBusesRS section') > 0 ||
          q('[class*="bus-item"], [class*="bus-card"], [class*="bus-result"]') > 0 ||
          q('[class*="error"], [class*="no-results"], [id*="error"]') > 0
        );
      }, { timeout: 40000 }).catch(() => false);

      // Check for error messages
      const errorMessage = await page.evaluate(() => {
        const errorSelectors = ['[class*="error"], [class*="no-results"], [id*="error"]', '.alert', '.message'];
        for (const sel of errorSelectors) {
          const el = document.querySelector(sel);
          if (el) return el.textContent.trim();
        }
        return null;
      });

      // Capture HTML and screenshot for debugging
      const html = await page.content();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      debugFile = `debug_bus_${source}_${destination}_${travelDate}_${attempt}_${timestamp}.html`;
      screenshot = `debug_screenshot_${source}_${destination}_${travelDate}_${attempt}_${timestamp}.png`;
      fs.writeFileSync(debugFile, html);
      await page.screenshot({ path: screenshot, fullPage: true });

      if (!hasResults && !errorMessage) {
        console.log('No results found, attempting to scroll for lazy loading');
        await page.evaluate(async () => {
          await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 400;
            const maxScrolls = 20;
            let scrolls = 0;
            const timer = setInterval(() => {
              window.scrollBy(0, distance);
              totalHeight += distance;
              scrolls++;
              if (totalHeight >= document.body.scrollHeight || scrolls >= maxScrolls) {
                clearInterval(timer);
                resolve();
              }
            }, 150);
          });
        });

        // Final check for results
        await page.waitForFunction(() => {
          const q = (s) => document.querySelectorAll(s).length;
          return (
            q('#displayBuses .currentBus') > 0 ||
            q('.vailableBusesRS section') > 0 ||
            q('[class*="bus-item"], [class*="bus-card"], [class*="bus-result"]') > 0 ||
            q('[class*="error"], [class*="no-results"], [id*="error"]') > 0
          );
        }, { timeout: 10000 }).catch(() => console.log('No results after scrolling'));
      }

      // Check for error messages again
      const finalErrorMessage = await page.evaluate(() => {
        const errorSelectors = ['[class*="error"], [class*="no-results"], [id*="error"]', '.alert', '.message'];
        for (const sel of errorSelectors) {
          const el = document.querySelector(sel);
          if (el) return el.textContent.trim();
        }
        return null;
      });

      // Parse HTML with Cheerio
      const $ = cheerio.load(html);
      const buses = extractBusResults($);
      const journeyDetails = extractJourneyDetails($, source, destination, travelDate);
      const filters = extractFilters($);
      const discountOffer = extractDiscountOffer($);

      if (!buses.length && finalErrorMessage) {
        throw new Error(`No bus results found. Website message: ${finalErrorMessage}`);
      }
      if (!buses.length) {
        throw new Error('No bus results found after loading and scrolling');
      }

      return {
        success: true,
        data: { journeyDetails, buses, filters, discountOffer },
        metadata: {
          sourceUrl: searchUrl,
          scrapedAt: new Date().toISOString(),
          cacheUsed: false,
          attempt,
          networkRequests,
          debugFile,
          screenshot,
        },
      };
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err);
      if (attempt === maxRetries) {
        return {
          success: false,
          data: null,
          metadata: {
            error: err.message,
            debugSuggestions: [
              `Check URL: ${searchUrl}`,
              'Verify Puppeteer StealthPlugin is correctly applied',
              'Run in non-headless mode to observe page behavior (set headless: false)',
              'Increase timeouts or adjust waitUntil to "networkidle0"',
              `Inspect saved HTML (${debugFile || 'not generated'}) and screenshot (${screenshot || 'not generated'}) for CAPTCHAs or errors`,
              'Use networkRequests to identify and scrape JSON endpoints directly',
              'Ensure form selectors match the website (sourceCity, destinationCity, doj, searchBuses)',
              'Verify autocomplete suggestions are loading (check suggestions log and adjust selectors)',
              'Check if the date format (DD-MM-YYYY) is correct for the website',
              'Test manually on the website to confirm route/date availability',
              `Inspect pre-submit screenshot (${preSubmitScreenshot || 'not generated'}) and form HTML to verify form state`,
            ],
            networkRequests,
            debugFile: debugFile || 'not generated',
            screenshot: screenshot || 'not generated',
          },
        };
      }
      // Add delay between retries to avoid rate limiting
      await delay(2000);
    } finally {
      if (page) await page.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
    }
  }
};

// Main controller
const getBusData = async (req) => {
  try {
    const { source, destination, travelDate, searchId, forceDynamic = false } = req.body;

    // Validate input
    validateInput(source, destination, travelDate, searchId);

    // Normalize travel date
    const normalizedTravelDate = normalizeDate(travelDate);
    console.log(`Fetching bus data for ${source} to ${destination} on ${normalizedTravelDate}${searchId ? ` with searchId=${searchId}` : ''}`);

    // Check if static HTML can be used
    const $ = cheerio.load(htmlContent);
    const staticSource = $('input[name="source1"]').val()?.toLowerCase();
    const staticDestination = $('input[name="destination1"]').val()?.toLowerCase();
    const staticDate = $('input[name="jdate1"]').val();

    if (
      !forceDynamic &&
      !searchId &&
      source.toLowerCase() === staticSource &&
      destination.toLowerCase() === staticDestination &&
      normalizedTravelDate === staticDate
    ) {
      console.log('Using static HTML data');
      const result = scrapeStaticData(source, destination, normalizedTravelDate);
      if (result.success) {
        return result;
      }
      console.log('Static scraping failed, falling back to dynamic');
    }

    console.log('Using dynamic scraping with Puppeteer');
    return await scrapeDynamicData(source, destination, normalizedTravelDate, searchId);
  } catch (error) {
    console.error('Error in getBusData:', error);
    throw new ApiError(error.statusCode || 500, error.message || 'Failed to fetch bus data');
  }
};

export { getBusData };