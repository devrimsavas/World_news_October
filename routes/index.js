var express = require("express");
var router = express.Router();
//var bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
//add redis
var client = require("../redis.js");
//add pagination
const getPagination = require("../getPagination");
//source for links
const { sources } = require("../data/sources.js");
const { sourceMap } = require("../data/sources.js");
//add auth middleware
const { requiresAuth } = require("express-openid-connect");
//selenium
const { Builder, By, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
//headlines
let allHeadlines = [];
//loading time
let loadingTime = 0;
//just test with axios
const axios = require("axios");

//function to save news to file
function saveHeadlinesToFile(headlines) {
  const filePath = path.join(__dirname, "headlines.json");
  fs.writeFile(filePath, JSON.stringify(headlines), (err) => {
    if (err) {
      console.log("Error while saving to file", err);
    } else {
      console.log("File saved successfully");
    }
  });
}
//add redis middleware it is for all keys
async function cache(req, res, next) {
  let cacheKey;
  if (req.method === "POST" && req.body.sourcebar) {
    // Dynamically generate the cache key based on the POST body content
    cacheKey = `source:${encodeURIComponent(req.body.sourcebar)}`;
  } else {
    // Fallback or different strategy for non-POST requests or when sourcebar isn't available
    cacheKey = req.originalUrl;
  }

  const startTime = Date.now();

  try {
    const data = await client.get(cacheKey);
    if (data !== null) {
      console.log(`Cache hit for key: ${cacheKey}`);
      const headlines = JSON.parse(data);
      const endTime = Date.now();
      const loadingTime = (endTime - startTime) / 1000;
      //cache hit render
      return res.render("index", {
        title: "WORLD NEWS cache hit",
        headlines: headlines,
        loadingTime: loadingTime,
        page: 1,
        letter: "A",
        size: 25,
        isAuthenticated: req.oidc.isAuthenticated(),
      });
    } else {
      console.log(`Cache miss for key: ${cacheKey}`);
      next();
    }
  } catch (error) {
    console.error(`Redis error for key: ${cacheKey}:`, error);
    next();
  }
}

//---------------routers start here

/* GET home page. */
router.get("/", async function (req, res, next) {
  const page = 1;
  const size = 25;
  const letter = "A";

  //test for router response
  /*
  console.log(
    "---------------------it is response from index GET ROUTE -------------"
  );
  console.log("USER IS ", req.oidc.user);
  console.log("IS AUTHENTICATED ", req.oidc.isAuthenticated());
  console.log("END OF ROUTE -----------");
  let randomPhoto;
  */

  //test for axios
  /*
  try {
    const response = await axios.get("https://randomuser.me/api/");
    randomPhoto = response.data.results[0].picture.large;
    //console.log(response.data);
    console.log("random photo", randomPhoto);
  } catch (error) {
    console.error(error);
  }
    */

  res.render("index", {
    title: "WORLD NEWS",
    headlines: [], // No headlines fetched yet
    loadingTime: 0, // No loading time yet
    page: page,
    letter: letter,
    size: size,
    isAuthenticated: req.oidc.isAuthenticated(),
    //randomPhoto: randomPhoto,
  });
});

//-----------post  route individual source route
router.post("/source", cache, async function (req, res, next) {
  console.log("post form intercepted");
  let searchLink = req.body.sourcebar; // Ensure this matches the name attribute in your form
  let page = 1;
  let size = 25;
  let letter = "A";

  //start time
  const startTime = Date.now();
  try {
    // Call the generateNews function and wait for its result
    let headlines = await generateNews(searchLink);
    const endTime = Date.now();
    const loadingTime = (endTime - startTime) / 1000;

    //caching processsed headlines

    const cacheKey = `source:${encodeURIComponent(searchLink)}`;
    //console.log("***************cacheKey", cacheKey);
    const cacheValue = JSON.stringify(headlines);
    await client.set(cacheKey, cacheValue, "EX", 3000);

    //render

    //test for router response
    /*
    console.log(
      "---------------------it is response from SOURCE POST  ROUTE -------------"
    );
    console.log("USER IS ", req.oidc.user);
    console.log("IS AUTHENTICATED ", req.oidc.isAuthenticated());
    console.log("END OF ROUTE -----------");
    */

    res.render("index", {
      title: "WORLD NEWS",
      headlines: headlines,
      loadingTime: loadingTime,
      page: 1,
      letter: "A",
      size: 25,
      isAuthenticated: req.oidc.isAuthenticated(),
      userProfile: JSON.stringify(req.oidc.user, null, 2),
    });
  } catch (error) {
    // In case of any errors, return an error message
    console.error("An error occurred in the POST /search route: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the news." });
  }
});

//get individual source route
router.get("/source", cache, async function (req, res, nex) {
  // #swagger.tags = ['News']
  // #swagger.description = 'Get all news based on source'
  // #swagger.produces=['text/html']
  // #swagger.responses=[200]
  let searchLink = req.query.sourcebar;
  const letter = req.query.page;
  const page = parseInt(req.query.pageNumber) || 2; //added for pagination
  const size = parseInt(req.query.pageSize) || 25; // defult size

  //using the getPagination function
  const { limit, offset } = getPagination(page, size);
  const startTime = Date.now();

  try {
    // Call the generateNews function and wait for its result
    let headlines = await generateNews(searchLink);
    // clean headlines
    console.log("Cleaned headlines:", headlines);
    const endTime = Date.now();
    const loadingTime = (endTime - startTime) / 1000;
    const cacheKey = `source:${encodeURIComponent(searchLink)}`;
    const cacheValue = JSON.stringify(headlines);
    await client.set(cacheKey, cacheValue, "EX", 3000);
    /*
    console.log(
      "---------------------it is response from SOURCE GET  ROUTE -------------"
    );
    console.log("USER IS ", req.oidc.user.nickname);
    console.log("IS AUTHENTICATED ", req.oidc.isAuthenticated());
    console.log("END OF ROUTE -----------");
    */

    res.render("index", {
      title: "WORLD NEWS",
      headlines: headlines,
      loadingTime: loadingTime,
      page: page,
      letter: letter,
      size: size,
      isAuthenticated: req.oidc.isAuthenticated(),
      userProfile: JSON.stringify(req.oidc.user, null, 2),
    });
  } catch (error) {
    console.error("An error occurred in the GET /search route: ", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the news." });
  }
});

router.post("/allSources", cache, async function (req, res, next) {
  //console.log("post form intercepted");
  //first capture letter from url query parameter
  const letter = "A";
  let page = 1;
  let size = 25;

  //console.log("selected letter for filtering", letter);
  const cacheKey = "allSources:aggregatedNews";

  //Attempt tp retrieve cached data first
  try {
    const cachedData = await client.get(cacheKey);
    /*
    console.log(
      "---------------------it is response from ALL SOURCE POST  ROUTE -------------"
    );
    */

    /*
    console.log("USER IS ", req.oidc.user);
    console.log("IS AUTHENTICATED ", req.oidc.isAuthenticated());
    console.log("END OF ROUTE -----------");
    */

    if (cachedData !== null) {
      console.log("Cache hit all sources");
      const headlines = JSON.parse(cachedData);
      return res.render("index", {
        title: "WORLD NEWS",
        headlines: headlines,
        loadingTime: 0,
        page: page,
        letter: letter,
        size: size,
        isAuthenticated: req.oidc.isAuthenticated(),
        userProfile: JSON.stringify(req.oidc.user, null, 2),
      });
    }
  } catch (error) {
    console.error("Redis error:", error);
  }
  const startTime = Date.now();

  let allHeadlines = [];

  for (let sourceLink of sources) {
    let headlines = await generateNews(sourceLink);
    allHeadlines = allHeadlines.concat(headlines);
  }

  // Sort and then deduplicate
  allHeadlines.sort((a, b) => a.text.localeCompare(b.text));
  allHeadlines = allHeadlines.filter(
    (headline, index, self) =>
      index === self.findIndex((t) => t.text === headline.text)
  );

  // Save the fetched and processed headlines to a file
  saveHeadlinesToFile(allHeadlines);
  const endTime = Date.now();
  const loadingTime = (endTime - startTime) / 1000;

  try {
    await client.set(cacheKey, JSON.stringify(allHeadlines), "EX", 1800);
    console.log("Cache set for all resources");
  } catch (error) {
    console.error("Redis error:", error);
  }

  console.log("all source user profiles test ", req.oidc.user);
  res.render("index", {
    title: "WORLD NEWS",
    headlines: allHeadlines, // No headlines yet
    loadingTime: 0,
    page: page,
    letter: letter,
    size: size,
    isAuthenticated: req.oidc.isAuthenticated(),
    userProfile: JSON.stringify(req.oidc.user, null, 2),
  });
});
//pagination all get

// Adapted to include pagination
router.get("/allSources", async function (req, res, next) {
  const letter = req.query.page;
  const page = parseInt(req.query.pageNumber) || 1; // Added for pagination
  const size = parseInt(req.query.pageSize) || 25; // Default size

  // Using the getPagination function
  const { limit, offset } = getPagination(page, size);

  try {
    let allHeadlines =
      JSON.parse(await client.get("allSources:aggregatedNews")) || [];

    if (letter) {
      allHeadlines = allHeadlines.filter((headline) =>
        letter === "#"
          ? /^[0-9]/i.test(headline.text)
          : headline.text.toUpperCase().startsWith(letter.toUpperCase())
      );
    }

    // Apply pagination
    const paginatedHeadlines = allHeadlines.slice(offset, offset + limit);

    res.render("index", {
      title: "WORLD NEWS ",
      headlines: paginatedHeadlines,
      page: page,
      letter: letter,
      size: size,
      loadingTime: 0,
      isAuthenticated: req.oidc.isAuthenticated(),
      userProfile: JSON.stringify(req.oidc.user, null, 2),
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

// Live search route
router.get("/live-search", async function (req, res) {
  const query = req.query.query.trim().toLowerCase();

  fs.readFile(path.join(__dirname, "headlines.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading headlines file:", err);
      return res.status(500).json({ error: "Error fetching search results" });
    }

    let allHeadlines = [];
    try {
      allHeadlines = JSON.parse(data);
    } catch (parseErr) {
      console.error("Error parsing headlines file:", parseErr);
      return res.status(500).json({ error: "Error fetching search results" });
    }

    const filteredHeadLines = allHeadlines.filter((headline) =>
      headline.text.toLowerCase().includes(query)
    );

    res.json(filteredHeadLines);
  });
});

//---------------functions

// Function to map source URLs to source identifiers
function getSourceIdentifier(searchLink) {
  // Default to an empty string or a default source identifier if the URL isn't found in the map
  return sourceMap[searchLink] || "";
}

//selenium function

async function generateNews(searchLink) {
  let driver;
  try {
    let options = new chrome.Options();
    //.addArguments("disable-infobars")
    //.addArguments("--headless=new")

    //.addArguments("--no-sandbox");
    options.addArguments("--headless=new");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-software-rasterizer");

    // Temporarily push the window outside of the visible screen
    options.addArguments("--window-position=0,-3000");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    await driver.get(searchLink);

    let headlineElements = await driver.findElements(
      By.css("a,title,h2, img[srcset]")
    );
    let headlines = [];
    for (let element of headlineElements) {
      let text = await element.getText();
      let url = await element.getAttribute("href");
      if (text && url) {
        let source = getSourceIdentifier(searchLink);
        headlines.push({ text, url, source });
      }
    }
    cleanAndSortHeadlines(headlines);
    return headlines.sort((a, b) => a.text.localeCompare(b.text));
  } catch (error) {
    console.error("An error occurred in generateNews: ", error);
    return []; // Return an empty array or handle as needed
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

//function to clean headlines text from special chars

function cleanAndSortHeadlines(headlines) {
  // Remove special characters from the beginning of the text
  headlines.forEach((headline) => {
    headline.text = headline.text.replace(
      /[‘’'`~!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+/g,
      ""
    );
    //console.log("Cleaned text:", headlines);
  });
}

module.exports = router;
