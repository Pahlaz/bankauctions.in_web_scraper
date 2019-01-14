// for initializing environment variables
require('dotenv').config()

const puppeteer = require('puppeteer'),
      selectors = require('./selectors'),
      constants = require('./constants'),
      db = require('./db'),
      DBURL = process.env.DBURL || 'mongodb://localhost/db';

// Database connectivity
db.connect(DBURL);

(async () => {
  const browser = await puppeteer.launch({headless: true});
  var pageNumber = 1;
  
  var scrapePosts = async (url) => {
    const page = await browser.newPage();
    await page.goto(url);

    // 'true' if page has no content
    var hasNoContent = await page.evaluate((pageContentSelector) => {
      return document.querySelector(pageContentSelector).textContent.trim().includes('No Results Found');
    }, selectors.pageContent);

    // if page contains the posts
    if(!hasNoContent) {
      console.log('scraping url: ' + url);

      // selecting all post header button reference
      var posts = await page.$$(selectors.postHeader);

      // for each post
      for(let i = 0; i < posts.length; i++) {
        // getting current listing id
        var currentListingID = await page.evaluate((listingIDSelector, index) => {
          return document.querySelectorAll(listingIDSelector)[index].textContent.trim().match(/\d+/)[0];
        }, selectors.postHeader, i);

        console.log("currentListingID: " + currentListingID);

        // add post to db if already not exist
        if( !(await db.isPostExist(currentListingID)) ) {
          await page.waitForSelector(selectors.postHeader);
          await posts[i].click();
          await page.waitFor(5000);

          // selecting all keys in table
          var postTableRows = await page.$$(selectors.postTableRows);
          let postDetails = {};

          // adding listing id value in object 
          postDetails["listingID"] = await page.evaluate((listingIDSelector) => {
            return document.querySelector(listingIDSelector).innerText;
          }, selectors.listingID);

          // adding rest key values
          for(let j = 1; j <= postTableRows.length - 3; j++){
            let keySelector = selectors.postTable.replace('$row', j).replace('$col', 1);
            let valueSelector = selectors.postTable.replace('$row', j).replace('$col', 2);
            
            let key = await page.evaluate((keySelector) => {
              return document.querySelector(keySelector).innerText;
            }, keySelector);

            key = key.replace(':', '').trim();

            let value = await page.evaluate((valueSelector) => {
              return document.querySelector(valueSelector).innerText;
            }, valueSelector);

            postDetails[key] = value.trim();
          }

          db.addPost(postDetails);

          await page.goBack();
          posts = await page.$$(selectors.postHeader);
        }
        else {
          console.log('post already exist');
        }
      }

      await page.close();

      pageNumber++;

      // scrape posts from rest page
      await scrapePosts(constants.baseURLWithPageNumber.replace('<page_no>', pageNumber));
    }
    else {
      console.log('Scrapped all posts');
    }
  }

  // scrape posts from all pages
  await scrapePosts(constants.baseURLWithPageNumber.replace('<page_no>', pageNumber));

  await browser.close();
  db.disconnect();
})();