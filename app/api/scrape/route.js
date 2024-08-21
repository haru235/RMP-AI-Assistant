import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { url } = await req.json();
  console.log(`Received URL: ${url}`);

  let browser;

  try {
    // Launch Puppeteer
    console.log("Launching browser...");
    browser = await puppeteer.launch({ headless: true });

    // Open a new page
    console.log("Opening new page...");
    const page = await browser.newPage();

    // Navigate to the provided URL
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for the necessary selector to appear
    console.log("Waiting for the teacher information selector...");
    await page.waitForSelector(".TeacherInfo__StyledTeacher-ti1fio-1.kFNvIp", {
      timeout: 5000,
    });

    console.log("Checking for cookie consent popup...");
    try {
      await page.waitForSelector(
        ".Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw",
        { timeout: 5000 }
      );
      console.log("Cookie consent popup detected. Accepting...");
      await page.click(
        ".Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw"
      );
      console.log("Cookie consent accepted.");
    } catch (popupErr) {
      console.log("No cookie consent popup found or unable to click.");
    }

    // Extract the professor's information
    console.log("Extracting professor information...");
    const profInfo = await page.evaluate(() => {
      try {
        const nameElem = document.querySelector(
          ".NameTitle__LastNameWrapper-dowf0z-2.glXOHH"
        ).textContent;
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
        console.error("Error inside page.evaluate:", innerErr);
        return { error: innerErr.message };
      }
    });

    // Log the extracted information
    console.log("Professor Information:", profInfo);

    const reviews = [];

    while (true) {
      try {
        // Wait for the reviews section to be available
        await page.waitForSelector(".RatingsList__RatingsUL-hn9one-0.cbdtns", { timeout: 5000 });
        console.log("Ratings list found. Scraping reviews...");

        // Scrape reviews on the current page
        const newReviews = await page.evaluate(() => {
          const reviewElements = document.querySelectorAll(
            ".Rating__RatingBody-sc-1rhvpxz-0.dGrvXb"
          );

          return Array.from(reviewElements).map((review) => {
            const professor =
              document
                .querySelector(".NameTitle__LastNameWrapper-dowf0z-2.glXOHH")
                ?.textContent.trim() || "Unknown";
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

            return {
              professor,
              content,
              quality: parseInt(quality, 10) || 0,
              difficulty: parseInt(difficulty, 10) || 0,
            };
          });
        });

        // Append new reviews to the list
        if (newReviews.length > 0) {
            const currLength = reviews.length
          reviews.push(...newReviews.slice(currLength));
          console.log(
            `Added ${newReviews.length - currLength} reviews. Total reviews: ${reviews.length}`
          );
        } else {
          console.log("No new reviews found on this page.");
          break; // Exit the loop if no reviews are found
        }

        // Try to find the "Load More" button and click it
        const loadMoreButton = await page.$(
          ".Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.glImpo"
        );

        if (loadMoreButton) {
          console.log("Load More button found. Clicking...");
          await loadMoreButton.click();
          await page.waitForFunction(
            () => !document.querySelector('.Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.glImpo'),
            { timeout: 5000 }
          );
        } else {
          console.log("No Load More button found. Exiting...");
          break; // Exit the loop if the "Load More" button is not found
        }
      } catch (error) {
        console.error("Error during scraping:", error.message);
        break; // Exit the loop if there's an error
      }
    }

    console.log("Scraping complete. Total reviews:", reviews.length);
    console.log("Sample review:", reviews[0]);

    // Return the extracted information
    return new NextResponse(JSON.stringify(profInfo), { status: 200 });
  } catch (err) {
    console.error("An error occurred:", err.message);
    return new NextResponse("Error", { status: 500 });
  } finally {
    // Ensure the browser is closed
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
  }
}
