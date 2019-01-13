# bankauctions.in web_scraper: Setup

## Introduction

A Node JS app for scrapping data from **https://bankauctions.in**.

## Dependencies

+ mongoose: NoSQL Database
+ puppeteer: Headless web browser 

## How to Use
+ Install all dependencies
  ```
    npm install
  ```

+ Start mongodb or set environtemt variable **DBURL** to the database link
  ```
    mongod -dbpath ./db/data
  ```

+ Start scraping
  ```
    npm run start
  ```

## About Author

Author - [Divyank Pahlazani](https://github.com/Pahlaz "Github")
