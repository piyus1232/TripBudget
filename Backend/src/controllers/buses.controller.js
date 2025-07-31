// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import fs from 'fs/promises';

// puppeteer.use(StealthPlugin());

//  async function scrapeRedbusBuses(fromCity, toCity, date) {
//   const formattedDate = date.split('-').reverse().join('-');
//   const url = `https://www.abhibus.com/bus_search/${encodeURIComponent(
//     fromCity
//   )}/${encodeURIComponent(toCity)}/${formattedDate}`;
//   const homepage = 'https://www.abhibus.com/';

//   const browser = await puppeteer.launch({
//     headless: 'new',
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--window-size=1920,1080',
//       '--disable-web-security',
//       '--disable-features=site-per-process',
//       '--disable-blink-features=AutomationControlled', // Enhanced anti-bot
//       '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
//     ],
//     defaultViewport: { width: 1920, height: 1080 },
//   });

//   const page = await browser.newPage();

//   await page.setExtraHTTPHeaders({
//     'accept-language': 'en-US,en;q=0.9',
//     accept:
//       'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
//   });

//   try {
//     console.log(`Navigating to AbhiBus URL: ${url}`);
//     await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

//     await page.screenshot({ path: 'abhibus-initial.png', fullPage: true });
//     console.log('Initial page screenshot saved as abhibus-initial.png');

//     // Check if results loaded or need form submission
//     let searchPerformed = false;
//     const searchFormSelector = '#search-form, .search-box, form[action*=\'bus_search\']';
//     const hasForm = await page.$(searchFormSelector);
//     if (hasForm || !(await page.$('.container.card.mobile-ui.service.light.rounded-md[id^=\'service-\']'))) {
//       console.log('No results or form detected, navigating to homepage for search...');
//       await page.goto(homepage, { waitUntil: 'networkidle2', timeout: 90000 });
//       const homeForm = await page.$(searchFormSelector);
//       if (homeForm) {
//         console.log('Simulating search from homepage...');
//         await page.select('#fromCity', fromCity);
//         await page.select('#toCity', toCity);
//         await page.type('#journeyDate', formattedDate);
//         await Promise.all([
//           page.click('.search-button, button[type=\'submit\']'),
//           page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
//         ]);
//         searchPerformed = true;
//       } else {
//         console.error('No search form found on homepage.');
//         throw new Error('Unable to locate search form.');
//       }
//     }

//     // Wait for the parent container or indicators with increased timeout
//     await page.waitForSelector('.container.card.mobile-ui.service.light.rounded-md[id^=\'service-\'], .loading-indicator, .captcha', { timeout: 60000 })
//       .then(() => console.log('Found target container or indicator'))
//       .catch((err) => console.log('No target container or indicator found:', err.message));

//     // Check for CAPTCHA or no results
//     const captcha = await page.$('.captcha, .g-recaptcha');
//     if (captcha) {
//       console.error('CAPTCHA detected, scraping blocked.');
//       await page.screenshot({ path: 'abhibus-captcha.png', fullPage: true });
//       throw new Error('CAPTCHA detected, manual intervention required.');
//     }

//     let apiData = null;
//     page.on('response', async (response) => {
//       const url = response.url();
//       if (url.includes('buslist') || url.includes('search')) {
//         try {
//           apiData = await response.json();
//           console.log('Intercepted API response:', url);
//         } catch (err) {
//           console.log('Non-JSON response:', url);
//         }
//       }
//     });

//     console.log('Waiting for bus items...');
//     const selectors = [
//       '.container.card.mobile-ui.service.light.rounded-md[id^=\'service-\']', // Primary selector
//       '.travel-distance',
//       '.col[id^=\'service-operator-agent-name-\']',
//       '.bus-details',
//       '.bus-item',
//       '.buslisting-container',
//       '.bus-details-wrapper',
//       '.bus-card',
//       '.bus-result-item',
//       '.bus-listing',
//     ];
//     let busItemsFound = false;
//     let selectedSelector = '';
//     for (const selector of selectors) {
//       try {
//         await page.waitForSelector(selector, { timeout: 20000 });
//         console.log(`Found bus items with selector: ${selector}`);
//         selectedSelector = selector;
//         busItemsFound = true;
//         break;
//       } catch (err) {
//         console.log(`Selector ${selector} not found, trying next...`);
//       }
//     }

//     if (!busItemsFound) {
//       console.error('No bus items found with any selector.');
//       await page.screenshot({ path: 'abhibus-error.png', fullPage: true });
//       const html = await page.content();
//       await fs.writeFile('abhibus-error.html', html);
//       throw new Error('Failed to find bus items on the page.');
//     }

//     await page.evaluate(async () => {
//       await new Promise((resolve) => {
//         let totalHeight = 0;
//         const distance = 200;
//         const timer = setInterval(() => {
//           window.scrollBy(0, distance);
//           totalHeight += distance;
//           if (totalHeight >= document.body.scrollHeight) {
//             clearInterval(timer);
//             resolve();
//           }
//         }, 200);
//       });
//     });

//     const buses = await page.evaluate((selector) => {
//       const busItems = document.querySelectorAll('.container.card.mobile-ui.service.light.rounded-md[id^=\'service-\']');
//       return Array.from(busItems).map((item) => {
//         const timeSection = item.querySelector('[id^=\'service-operator-travel-distance-\']');
//         const nameSection = item.querySelector('[id^=\'service-operator-agent-name-\']');
//         const fareSection = item.querySelector('.container .offer-price') || item.querySelector('.fare-hint')?.nextElementSibling;

//         return {
//           name: nameSection?.querySelector('.title')?.innerText.trim() || 'N/A',
//           departure: timeSection?.querySelector('.start-time')?.innerText.trim() || 'N/A',
//           arrival: timeSection?.querySelector('.end-time')?.innerText.trim() || 'N/A',
//           fare: fareSection?.querySelector('.offer-price, .text-neutral-800')?.innerText.trim().replace(/[^0-9]/g, '') || 'N/A',
//           busType: nameSection?.querySelector('.sub-title')?.innerText.trim() || 'N/A',
//           duration: timeSection?.querySelector('.chip-icon')?.innerText.trim() || 'N/A',
//         };
//       });
//     }, selectedSelector);

//     if (buses.length === 0 && apiData && (apiData.busList || apiData.data?.busList)) {
//       console.log('Falling back to API data...');
//       const busList = apiData.busList || apiData.data?.busList || [];
//       buses.push(
//         ...busList.map((bus) => ({
//           name: bus.operatorName || bus.travels || 'N/A',
//           departure: bus.departureTime || 'N/A',
//           arrival: bus.arrivalTime || 'N/A',
//           fare: bus.ticketPrice || bus.fare || 'N/A',
//           busType: bus.busType || 'N/A',
//           duration: bus.journeyDuration || 'N/A',
//         }))
//       );
//     }

//     if (buses.length === 0) {
//       console.warn('No buses extracted. Check selector mappings or API data.');
//       await page.screenshot({ path: 'abhibus-empty.png', fullPage: true });
//     } else {
//       console.log(`Found ${buses.length} buses:`);
//       console.log(buses);
//       await fs.writeFile('abhibus-results.json', JSON.stringify(buses, null, 2));
//       console.log('Results saved to abhibus-results.json');
//     }

//     return buses;
//   } catch (err) {
//     console.error('❌ Scraping Error:', err.message);
//     await page.screenshot({ path: 'abhibus-error.png', fullPage: true });
//     const html = await page.content();
//     await fs.writeFile('abhibus-error.html', html);
//     throw err;
//   } finally {
//     await browser.close();
//     console.log('Browser closed.');
//   }
// }

// export async function getBuses(req, res) {
//   try {
//     const { fromCity = 'Jaipur', toCity = 'Delhi', date = '02-08-2025' } = req.query;
//     const buses = await scrapeAbhiBus(fromCity, toCity, date);
//     res.json({ success: true, buses });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }


// // module.exports = { getBuses };
// // module.exports = { getBuses };

// // module.exports = { getBuses };

// // Run the script
// // scrapeRedbusBuses().catch((err) => console.error("Script failed:", err));


// // // 🔽 Example use
// scrapeRedbusBuses('jaipur', 'delhi', '2025-08-01')
// //   .then(buses => console.log(buses))
// //   .catch(err => console.error("Scraping error:", err));
// export {scrapeRedbusBuses}