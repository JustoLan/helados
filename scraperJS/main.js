const fs = require('fs');
const path = require('path');
const scrapePrice = require('./scrapePrice');
const handleTimeouts = require('./handleTimeouts');
const writeToJson = require('./writeToJson');
const moment = require('moment-timezone'); // Add this line

// async function main() {
//     try {
//         // Read the JSON file containing URLs
//         const jsonData = fs.readFileSync('urls.json', 'utf-8');
//         const urls = JSON.parse(jsonData);

//         // Scraping prices for all URLs
//         const prices = [];
//         const timeoutUrls = []; // Array to store URLs with no price found

//         for (const url of urls) {
//             try {
//                 const price = await scrapePrice(url);
//                 if (price !== null) {
//                     // Extract restaurant name from URL
//                     const restaurantName = url.split('/')[4].replace(/-/g, ' '); // Extract the name from the URL
//                     prices.push({ restaurantName, price }); // Push both restaurant name and price
//                     console.log(`Price from ${restaurantName}: ${price}`);
//                 } else {
//                     console.error(`No price found for ${url}`);
//                     timeoutUrls.push(url); // Push the URL to timeoutUrls array
//                 }
//             } catch (error) {
//                 console.error(`Error scraping price from ${url}:`, error);
//             }
//         }

//         const timeoutPrices = [];
//         for (const url of timeoutUrls) {
//             try {
//                 const price = await scrapePrice(url);
//                 if (price !== null) {
//                     const restaurantName = url.split('/')[4].replace(/-/g, ' '); // Extract the name from the URL
//                     timeoutPrices.push({ restaurantName, price }); // Push both restaurant name and price
//                     console.log(`Price from ${restaurantName}: ${price}`);
//                 } else {
//                     console.error(`No price found for ${url}`);
//                 }
//             } catch (error) {
//                 console.error(`Error scraping price from ${url}:`, error);
//             }
//         }

//         // Combine original and timeout prices
//         const allPrices = prices.concat(timeoutPrices);

//         // Get the current date in Argentina's timezone
//         const currentDateInArgentina = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD');

//         // Write prices to a new archive file with the current date in the filename
//         const archiveFilename = `restaurant_prices_${currentDateInArgentina}.json`;
//         const archivePath = path.join('..', 'scraped-data', archiveFilename);
//         writeToJson(allPrices, archivePath);

//         // Writing timeout URLs to JSON file
//         const timeoutUrlsPath = path.join('..', 'scraped-data', 'timeout_urls.json');
//         writeToJson(timeoutUrls, timeoutUrlsPath);

//         // Handling timeout URLs
//         handleTimeouts(timeoutUrls);
        
//     } catch (error) {
//         console.error('Error reading URLs from the file:', error);
//     }
// }

// main();

async function main() {
    try {
        // Read the JSON file containing URLs
        const jsonData = fs.readFileSync('urls.json', 'utf-8');
        const urls = JSON.parse(jsonData);

        let retryUrls = [...urls]; // Copy of original URLs to retry
        
        // Array to store prices and URLs with no price found
        const prices = [];
        const timeoutUrls = [];
        let timeoutPrices = []; // Declaring timeoutPrices outside the loop

        while (retryUrls.length > 0) {
            // Clear timeoutPrices for each retry iteration
            timeoutPrices = [];
            
            for (const url of retryUrls) {
                try {
                    const price = await scrapePrice(url);
                    if (price !== null) {
                        // Extract restaurant name from URL
                        const restaurantName = url.split('/')[4].replace(/-/g, ' ');
                        prices.push({ restaurantName, price });
                        console.log(`Price from ${restaurantName}: ${price}`);
                    } else {
                        console.error(`No price found for ${url}`);
                        timeoutUrls.push(url);
                    }
                } catch (error) {
                    console.error(`Error scraping price from ${url}:`, error);
                    timeoutUrls.push(url);
                }
            }
            
            // Update retryUrls with the remaining timeoutUrls for the next iteration
            retryUrls = [...timeoutUrls];
            
            // Clear timeoutUrls for the next iteration
            timeoutUrls.length = 0;
        }

        // Get the current date in Argentina's timezone
        const currentDateInArgentina = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD');

        // Combine original and timeout prices
        const allPrices = prices.concat(timeoutPrices);

        // Write prices to a new archive file with the current date in the filename
        const archiveFilename = `restaurant_prices_${currentDateInArgentina}.json`;
        const archivePath = path.join('..', 'scraped-data', archiveFilename);
        writeToJson(allPrices, archivePath);

        // Writing timeout URLs to JSON file
        const timeoutUrlsPath = path.join('..', 'scraped-data', 'timeout_urls.json');
        writeToJson(timeoutUrls, timeoutUrlsPath);

        // Handling timeout URLs
        handleTimeouts(timeoutUrls);
        
    } catch (error) {
        console.error('Error reading URLs from the file:', error);
    }
}

main();