const puppeteer = require('puppeteer');

async function scrapePrice(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let price = null; // Initialize price as null

    try {
        console.log(`Navigating to URL: ${url}`);
        await page.goto(url);

        console.log("Page loaded successfully");

        const priceElement = await page.waitForSelector('div.sc-iqzUVk.dEMOxH > span.sc-bxivhb.bLhELA');
        if (priceElement) {
            console.log("Price selector found");
            price = await page.$eval('div.sc-iqzUVk.dEMOxH > span.sc-bxivhb.bLhELA', element => element.textContent.trim());
            console.log("Price scraped successfully:", price);
        } else {
            console.error("Price selector not found");
        }
    } catch (error) {
        console.error(`Error scraping price from ${url}:`, error);
    } finally {
        await browser.close();
    }

    return price;
}

module.exports = scrapePrice;