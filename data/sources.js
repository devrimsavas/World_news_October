// File: /data/sources.js

// ../data/sources.js
const sources = [
  "https://www.bbc.com/",
  "https://edition.cnn.com/",
  "https://www.foxnews.com/",
  "https://www.euronews.com/",
  "https://www.aljazeera.com/",
  "https://www.msnbc.com/",
  "https://www.dw.com/en/top-stories/s-9097",
  "https://news.sky.com/",
  "https://www.welt.de/english-news/",
  "https://www.nrk.no/about/"
];

const sourceMap = {
  "https://www.bbc.com/": "bbc",
  "https://edition.cnn.com/": "cnn",
  "https://www.foxnews.com/": "foxs",
  "https://www.euronews.com/": "euronews",
  "https://www.aljazeera.com/": "aljazeera",
  "https://www.msnbc.com/": "msnbc",
  "https://www.dw.com/en/top-stories/s-9097": "dw",
  "https://news.sky.com/": "skynews",
  // Add other mappings as needed
};

module.exports = { sources, sourceMap };
