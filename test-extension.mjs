import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extPath = path.join(__dirname, 'chrome-extension');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
    console.log("Launching Chromium with the careerzen extension...");
    const browser = await puppeteer.launch({
        headless: false, // Pop up so the user can see it!
        executablePath: chromePath,
        args: [
            `--disable-extensions-except=${extPath}`,
            `--load-extension=${extPath}`
        ]
    });

    console.log("Navigating to a mocked LinkedIn job page...");
    const page = await browser.newPage();

    // We will intercept requests to a fake linkedin URL and serve our own HTML
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url() === 'https://www.linkedin.com/jobs/view/careerzen-test') {
            request.respond({
                status: 200,
                contentType: 'text/html',
                body: `
                <!DOCTYPE html>
                <html>
                <head><title>Mock Job | LinkedIn</title></head>
                <body>
                    <div class="job-details-jobs-unified-top-card__job-title">Senior AI Engineer</div>
                    <div class="job-details-jobs-unified-top-card__company-name">DeepMind</div>
                    <div>
                        <button class="jobs-apply-button--top-card">Easy Apply</button>
                    </div>
                    <div class="jobs-description__content">
                        We are looking for a Senior AI Engineer with 5+ years of experience in Large Language Models, PyTorch, and Next.js.
                    </div>
                </body>
                </html>
                `
            });
        } else {
            request.continue();
        }
    });

    // Go to our fake LinkedIn URL
    await page.goto('https://www.linkedin.com/jobs/view/careerzen-test');

    console.log("Looking for careerzen button...");

    // Wait for extension to inject the button
    await new Promise(r => setTimeout(r, 2000));

    const btn = await page.$('#careerzen-analyze-btn');
    if (btn) {
        console.log("✅ Extension successfully injected! Clicking the button...");
        await btn.click();

        console.log("Waiting for new tab to open to localhost:3000/optimize...");

        // Find the new page
        let newPage = null;
        for (let i = 0; i < 20; i++) {
            const pages = await browser.pages();
            newPage = pages.find(p => p.url().includes('localhost:3000'));
            if (newPage) break;
            await new Promise(r => setTimeout(r, 500));
        }

        if (newPage) {
            console.log("New tab captured. Checking the URL...");
            console.log("URL is: " + newPage.url());
            console.log("Waiting for Next.js app to load and extension to auto-fill (6s)...");
            await new Promise(r => setTimeout(r, 6000)); // give next.js 6 seconds to load

            await newPage.screenshot({ path: 'extension_test_result.png' });
            console.log("✅ Screenshot saved to extension_test_result.png");

            const textareaVal = await newPage.evaluate(() => {
                const textareas = document.querySelectorAll('textarea');
                let found = null;
                textareas.forEach(ta => {
                    if (ta.placeholder.toLowerCase().includes('job description') || ta.id.toLowerCase().includes('job')) {
                        found = ta;
                    }
                });
                if (!found && textareas.length > 0) Object.values(textareas).pop();
                return found ? found.value : (textareas.length > 0 ? textareas[textareas.length - 1].value : null);
            });

            if (textareaVal && textareaVal.includes('Senior AI Engineer')) {
                console.log("🚀 SUCCESS! The job description was automatically filled into the Next.js app!");
                fs.writeFileSync('test-success.txt', 'SUCCESS');
            } else {
                console.log("❌ FAILED. Textarea value was: ", textareaVal);
            }
        } else {
            console.log("❌ FAILED. Never saw the localhost:3000 tab open.");
            console.log("Pages available:", (await browser.pages()).map(p => p.url()));
        }
    } else {
        console.log("❌ FAILED. Button not found. Injection failed.");
    }

    console.log("Test finished. Closing browser in 4 seconds...");
    await new Promise(r => setTimeout(r, 4000));
    await browser.close();
    process.exit(0);
})();
