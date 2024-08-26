import puppeteer from "puppeteer";

export async function POST(req) {
    console.log("DEPARTMENT SCRAPE");
    const { url, department } = await req.json(); // Expecting department as part of the request

    let browser;
    let page;

    try {
        console.log("Launching browser...");
        browser = await puppeteer.launch({ headless: false });

        console.log(`Opening new page...`);
        page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 }); // Increase timeout to 120 seconds
        await page.waitForSelector('.css-1l6bn5c-control', { timeout: 60000 });

        console.log(`Checking for cookie consent popup...`);
        try {
            await page.waitForSelector(".Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw", { timeout: 5000 });
            console.log(`[Cookie consent popup detected. Accepting...]`);
            await page.click(".Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw");
            console.log(`[Cookie consent accepted.]`);
        } catch (popupErr) {
            console.log(`No cookie consent popup found or unable to click.`);
        }

        console.log(`Clicking on the dropdown...`);
        await page.click('.css-1l6bn5c-control');

        console.log(`Waiting for dropdown options to appear...`);
        await page.waitForSelector('.css-1u8e7rt-menu', { timeout: 60000 });
        const department = "Biology"
        console.log(`${department}`)
        console.log(`Selecting the option...`);
        // const [option] = await page.$x(`//div[contains(@class, "css-l0mlil-option") and text()="${department}"]`);
        const [option] = await page.$$(`xpath/.//div[contains(text(), "${department}")]`);

        if (option) {
            await option.click();
            console.log(`Option "${department}" selected.`);
        } else {
            console.log(`Option "${department}" not found.`);
        }

        // Wait a bit to ensure the selection is processed
        await page.waitForSelector(".TeacherCard__StyledTeacherCard-syjs0d-0 dLJIlx", { timeout: 60000 });
        console.log("done waiting")
        const professorName = await page.evaluate(() => {
            const firstProfessor = document.querySelector('.CardName__StyledCardName-sc-1gyrgim-0 cJdVEK'); // Replace with the actual class or selector
            return firstProfessor ? firstProfessor.innerText : 'No professor found';
          });
          
          console.log(`First professor's name: ${professorName}`);

    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        if (browser) {
            console.log("Closing browser...");
            await browser.close();
        }
    }
}
