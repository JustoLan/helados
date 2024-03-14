async function handleTimeouts(urls) {
    const puppeteer = require('puppeteer');

    const timeoutUrls = [];

    for (const url of urls) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        try {
            await Promise.race([
                page.goto(url),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
            ]);

            // Add your scraping logic here if needed
        } catch (error) {
            console.error(`Error scraping URL ${url}:`, error);
            timeoutUrls.push(url);
        } finally {
            await browser.close();
        }
    }

    return timeoutUrls;
}

module.exports = handleTimeouts;