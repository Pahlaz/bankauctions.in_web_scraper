const puppeteer = require('puppeteer'),
      selectors = require('./selectors.json'),
      constants = require('./constants.json'),
      db = require('./db'),
      config = require('./config/default');

// Database connectivity
db.connect(config.dbURL);

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto(constants.baseURL);

  // selecting all post details button reference
  var posts = await page.$$(selectors.postLocator);
  var listingIDSelector = selectors.listingID;

  for(let i = 0; i < posts.length; i++) {
    await page.waitForSelector(selectors.postLocator);
    await posts[i].click();
    await page.waitFor(3000);

    // selecting all keys in table
    var postTableRows = await page.$$(selectors.postTableRows);
    let postDetails = {};

    // adding listing id value in object 
    postDetails["listingID"] = await page.evaluate((listingIDSelector) => {
      return document.querySelector(listingIDSelector).innerText;
    }, listingIDSelector);

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

      value = value.trim();
      postDetails[key] = value;
    }

    // add post to db if already not exist
    if( !(await db.isPostExist(postDetails.listingID)) ) {
      console.log('adding post');
      // adding post to db
      db.addPost(postDetails);
    }

    await page.goBack();
    posts = (await page.$$(selectors.postLocator));
  }

  await browser.close();
  db.disconnect();
})();