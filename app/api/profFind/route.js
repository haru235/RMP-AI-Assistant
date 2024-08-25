import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const { schoolName, firstName, lastName } = await req.json();

    if (!schoolName || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
  
    // http://localhost:3000/api/scrape-professor?schoolName=michigan%20state&firstName=Mindy&lastName=Morgan

    
    try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Step 1: Generate the School Search URL
    const schoolQuery = encodeURIComponent(schoolName.trim());
    const schoolSearchUrl = `https://www.ratemyprofessors.com/search/schools?q=${schoolQuery}`;
    await page.goto(schoolSearchUrl);

    // Step 2: Click the first result (School)
    await page.waitForSelector('a[href^="/school/"]');

    console.log("Checking for cookie consent popup...");
    try {
      // find the close button
      await page.waitForSelector(
        ".Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw",
        { timeout: 1000 }
      );
      // click the button
      console.log("Cookie consent popup detected. Accepting...");
      await page.click(
        ".Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw"
      );
      console.log("Cookie consent accepted.");
    } catch (popupErr) {
      console.log("No cookie consent popup found or unable to click.");
    }
    const schoolLink = await page.$('a[href^="/school/"]');
    await schoolLink.click();

    // Step 3: Extract the School ID from the URL
    await page.waitForNavigation();
    const schoolUrl = page.url();
    const schoolID = schoolUrl.split('/').pop();
    console.log("GOT SCHOOL ID", schoolID)

    // Step 4: Generate the Professor Search URL
    const professorQuery = `${firstName}%20${lastName}`;
    const professorSearchUrl = `https://www.ratemyprofessors.com/search/professors/${schoolID}?q=${professorQuery}`;
    await page.goto(professorSearchUrl);

    // Step 5: Click the first result (Professor)
    await page.waitForSelector('a[href^="/professor/"]');
    const professorLink = await page.$('a[href^="/professor/"]');
    await professorLink.click();

    const professorPageUrl = page.url();

    await browser.close();
    console.log("HERE ", professorPageUrl)
    // Return a JSON response with the extracted data
    return NextResponse.json({ message: 'Scraping completed successfully!', professorPageUrl });
  } catch (error) {
    console.error('Error during scraping:', error);
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
  }
}