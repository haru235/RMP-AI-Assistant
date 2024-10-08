import puppeteer from "puppeteer";
import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";


export async function POST(req) {
  // url of professor's page
  const { urls, max } = await req.json();
  urls.forEach(url => {
    console.log(`Received URL: ${url}`);
  });
  console.log(`Max reviews for each professor: ${max}`);

  let browser;
  let page;


  try {
    // Launch Puppeteer
    console.log("Launching browser...");
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage(); // Initialize page

    const profInfos = []

  

    for (const [index, url] of urls.entries()) {

      // Navigate to the provided URL
      console.log(`[${index}] Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2" });

      // Wait for the necessary selector to appear
      console.log(`[${index}] Waiting for the teacher information selector...`);
      await page.waitForSelector(".TeacherInfo__StyledTeacher-ti1fio-1.kFNvIp", {
        timeout: 5000,
      });

      // RMP shows a popup on first open
      console.log(`[${index}] Checking for cookie consent popup...`);
      try {
        // find the close button
        await page.waitForSelector(
          ".Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw",
          { timeout: 5000 }
        );
        // click the button
        console.log(`[${index}] Cookie consent popup detected. Accepting...`);
        await page.click(
          ".Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw"
        );
        console.log(`[${index}] Cookie consent accepted.`);
      } catch (popupErr) {
        console.log(`[${index}] No cookie consent popup found or unable to click.`);
      }

      // Extract the professor's information
      console.log(`[${index}] Extracting professor information...`);
      const profInfo = await page.evaluate(() => {
        try {
          let nameElem = document.querySelector(".NameTitle__Name-dowf0z-0.cfjPUG span")?.textContent.trim() || "Unknown"
          nameElem += ' ' +
            document
              .querySelector(".NameTitle__LastNameWrapper-dowf0z-2.glXOHH")
              ?.textContent.trim() || "Unknown";
          const starsElem = document.querySelector(
            ".RatingValue__Numerator-qw8sqy-2.liyUjw"
          ).textContent;
          const deptElem = document.querySelector(
            ".TeacherDepartment__StyledDepartmentLink-fl79e8-0.iMmVHb b"
          ).textContent;
          const schoolElem = document.querySelector(
            ".NameTitle__Title-dowf0z-1.iLYGwn a"
          ).textContent;
          const takeAgainElem = document.querySelector(
            ".FeedbackItem__FeedbackNumber-uof32n-1.kkESWs"
          ).textContent;
          const difficultyElem = document.querySelector(
            ".FeedbackItem__FeedbackNumber-uof32n-1.kkESWs"
          ).textContent;

          return {
            name: nameElem.trim(),
            stars: starsElem.trim(),
            dept: deptElem.replace(" department", ""),
            school: schoolElem.trim(),
            takeAgain: takeAgainElem.trim(),
            difficulty: difficultyElem.trim(),
          };

        } catch (innerErr) {
          console.error(`[${index}] Error inside page.evaluate:`, innerErr);
          return { error: innerErr.message };
        }
      });

      // Log the extracted information
      console.log(`[${index}] Professor Information:`, profInfo);

      const reviews = [];

      while (true) {
        try {
          // Wait for the reviews section to be available
          await page.waitForSelector(".RatingsList__RatingsUL-hn9one-0.cbdtns", { timeout: 5000 });
          console.log(`[${index}] Ratings list found. Scraping reviews...`);

          // Scrape reviews on the current page
          const newReviews = await page.evaluate((currLength, max) => {
            const reviewElements = document.querySelectorAll(
              ".Rating__RatingBody-sc-1rhvpxz-0.dGrvXb"
            );

            if (currLength >= max)
              return

            return Array.from(reviewElements).slice(currLength, max).map((review) => {
              const content =
                review
                  .querySelector(".Comments__StyledComments-dzzyvm-0.gRjWel")
                  ?.textContent.trim() || "No content";
              const quality =
                review
                  .querySelector(
                    ".CardNumRating__CardNumRatingNumber-sc-17t4b9u-2"
                  )
                  ?.textContent.trim() || "No rating";
              const difficulty =
                review
                  .querySelector(
                    ".CardNumRating__CardNumRatingNumber-sc-17t4b9u-2.cDKJcc"
                  )
                  ?.textContent.trim() || "No rating";
              const course =
                review
                  .querySelector(
                    ".RatingHeader__StyledClass-sc-1dlkqw1-3.eXfReS"
                  )
                  ?.textContent.trim() || "No course";
              const date =
                review
                  .querySelector(
                    ".TimeStamp__StyledTimeStamp-sc-9q2r30-0.bXQmMr.RatingHeader__RatingTimeStamp-sc-1dlkqw1-4.iwwYJD"
                  )
                  ?.textContent.trim() || "No date";



              return {
                content,
                quality: parseInt(quality, 10) || 0,
                difficulty: parseInt(difficulty, 10) || 0,
                course,
                date: date.replace(/(\d+)(st|nd|rd|th)/, '$1'),
              };
            });
          }, reviews.length, max);

          // Append new reviews to the list
          if (newReviews.length > 0) {
            reviews.push(...newReviews);
            console.log(
              `[${index}] Added ${newReviews.length} reviews. Total reviews: ${reviews.length}`
            );
          } else {
            console.log(`[${index}] No new reviews found on this page.`);
            break; // Exit the loop if no reviews are found
          }

          if (reviews.length >= max) break;

          // Try to find the "Load More" button and click it
          const loadMoreButton = await page.$(
            ".Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.glImpo"
          );

          if (loadMoreButton) {
            console.log(`[${index}] Load More button found. Clicking...`);
            await loadMoreButton.click();
            await page.waitForFunction(
              () => !document.querySelector('.Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.glImpo'),
              { timeout: 5000 }
            );
          } else {
            console.log(`[${index}] No Load More button found. Exiting...`);
            break; // Exit the loop if the "Load More" button is not found
          }
        } catch (error) {
          console.error(`[${index}] Error during scraping:`, error.message);
          break; // Exit the loop if there's an error
        }
      }

      console.log(`[${index}] Scraping complete. Total reviews: `, reviews.length);
      console.log(`[${index}] Sample review:`, reviews[0]);

      insertIntoPinecone(reviews, profInfo)
      console.log("AT SCRAPE: sending reviews to sentiment, ", reviews)
      try {
  
        // const sentimentResponse = await fetch('/api/sentiment', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(reviews),
        // });
        const sentimentResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviews }),
      });

      if (!sentimentResponse.ok) {
        throw new Error(`Failed to fetch sentiment analysis: ${sentimentResponse.statusText}`);
      }
      const sentimentData = await sentimentResponse.json();
      console.log("Sentiment analysis response:", sentimentData);
    // Return the extracted information
    return new NextResponse(JSON.stringify({ profInfo, reviews, sentimentData }), { status: 200,headers: { 'Content-Type': 'application/json' }, });
  } catch (error) {
    console.error("Error sending reviews to sentiment analysis API:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
 }
  } finally {
    // Ensure the browser is closed
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
  }
}

async function insertIntoPinecone(reviews, profInfo) {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})
  const processed_reviews = []
  for (const [index, review] of reviews.entries()) {
    const embedText = `${profInfo.name} at ${profInfo.school}for ${review.course} in ${profInfo.dept}: ${review.content}`
    const embedding = await generateEmbeddings(embedText, openai);
    processed_reviews.push({
      id: `${profInfo.name}-${profInfo.school}-${index}`,
      values: embedding,
      metadata: {
        review: review.content,
        subject: profInfo.dept,
        stars: review.quality,
        course: review.course,
        date: review.date,
        prof: profInfo.name,
        dept: profInfo.dept,
        school: profInfo.school,
      },
    });
  }
  await pc.index('rag').namespace("ns2").upsert(processed_reviews);
}

async function generateEmbeddings(review, openai) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: review,
    encoding_format: 'float',
  })
  return response.data[0].embedding
}


