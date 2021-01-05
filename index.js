const cheerio = require("cheerio");
const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();

const emptyChar = "⠀";

fetch("http://udim.koeri.boun.edu.tr/zeqmap/xmlt/son24saat.xml")
  .then((res) => res.text())
  .then((res) => evalRes(res))
  .catch((err) => console.log(err));

let comparer = (otherArray) => {
  return function (current) {
    return (
      otherArray.filter(function (other) {
        return other.date === current.date;
      }).length == 0
    );
  };
};

let evalRes = (res) => {
  const $ = cheerio.load(res, { xmlMode: true });
  const earthquakesDOM = getEarthquakesDOM($);
  const networkEarthquakes = createEarthquakesArray($, earthquakesDOM);
  readLocalFileEarthquakes()
    .then((strLocalEarthquakes) => {
      const localEarthquakes = JSON.parse(strLocalEarthquakes);
      const newEarthquakes = networkEarthquakes.filter(
        comparer(localEarthquakes)
      );
      console.log("newEarthquakes", newEarthquakes);
      const earthquakes = getEarthquakesBySelectedCriteria(newEarthquakes);
      console.log("earthquakes", earthquakes);
      // const smsText = createSmsText(earthquakes);
      sendNewEarthQuakesTweets(earthquakes);
      writeEarthquakesToFile(networkEarthquakes);
      // if (smsText.length === 0) {
      if (earthquakes.length === 0) {
        console.log("Earthquake not happened");
        writeTweetToFile("Earthquake not happened");
        return;
      }
      // writeSmsToFile(smsText);
    })
    .catch((err) => console.log(err));
};

let sendNewEarthQuakesTweets = (earthquakes) => {
  earthquakes.forEach((earthquake) => {
    sendTweet(createTweetText(earthquake), generateImageUrl(earthquake));
  });
};

let getEarthquakesDOM = ($) => {
  return $("earhquake");
};

let createEarthquakesArray = ($, earthquakesDOM) => {
  let earthquakes = [];
  earthquakesDOM.each((index, earthquake) => {
    earthquakes.push(createEarthQuakeObj($, earthquake));
  });
  return earthquakes;
};

let createEarthQuakeObj = ($, earthquake) => {
  const date = $(earthquake).attr("name").trim();
  const location = $(earthquake).attr("lokasyon").replace(/\s\s+/g, " ").trim();
  const lat = $(earthquake).attr("lat").trim();
  const lng = $(earthquake).attr("lng").trim();
  const mag = $(earthquake).attr("mag").trim();
  const depth = $(earthquake).attr("Depth").trim();
  return { date, location, lat, lng, mag, depth };
};

let writeEarthquakesToFile = (earthquakes) => {
  fs.writeFile(
    "previousEarthquakes.json",
    JSON.stringify(earthquakes),
    function (err) {
      if (err) return console.log(err);
      console.log("Written earthquakes.json");
    }
  );
};
const readFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    console.log(err);
  }
};

let readLocalFileEarthquakes = () => {
  return readFile("previousEarthquakes.json");
};

const getEarthquakesBySelectedCriteria = (newEarthquakes) => {
  const foundEarthquakes = [];
  const cities = process.env.CITIES_DELIMITED_WITH_SEMICOLON.split(";");
  const minMagnitude = process.env.MIN_MAGNITUDE;
  newEarthquakes.forEach((earthquake) => {
    cities.forEach((city) => {
      if (
        (city === "*" || earthquake.location.includes(city)) &&
        earthquake.mag >= minMagnitude
      ) {
        foundEarthquakes.push(earthquake);
      }
    });
  });
  return foundEarthquakes;
};

let createTweetText = (earthquake) => {
  let date = earthquake.date;
  if (date.includes(" ")) {
    date = date.split(" ")[1];
  }
  return `💢 ${earthquake.location}'de #deprem Büyüklük: ${earthquake.mag} Zaman: ${date}`;
};

let writeTweetToFile = (tweet) => {
  fs.writeFile("tweet.txt", tweet, function (err) {
    if (err) return console.log(err);
    console.log("Written tweet.txt");
  });
};

let sendTweet = (tweetText, imageUrl) => {
  const webhookKey = process.env.IFTTT_WEBHOOKS_KEY;
  const iftttEventName = process.env.IFTTT_EVENT;
  fetch(
    `https://maker.ifttt.com/trigger/${iftttEventName}/with/key/${webhookKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "value1": tweetText,
        // "value1" : imageUrl,
        // "value2" : tweetText
      }),
    }
  )
    .then((response) => console.log("Sent", response.text))
    .catch((error) => console.log("Sending error", error));
  writeTweetToFile(tweetText);
};

// let createSmsText = (earthquakes) => {
//   let smsTextArray = [];
//   earthquakes.forEach((earthquake) => {
//     smsTextArray.push(createSmsLine(earthquake));
//   });
//   if (smsTextArray.length === 0) return "";
//   return `${emptyChar}\n${emptyChar}\n${smsTextArray.join(
//     "\n"
//   )}\n${emptyChar}\n${emptyChar}`;
// };

// let createSmsLine = (earthquake) => {
//   let date = earthquake.date;
//   if (date.includes(" ")) {
//     date = date.split(" ")[1];
//   }
//   return `💢 ${earthquake.mag} ${date} ${earthquake.location}`;
// };

// let writeSmsToFile = (sms) => {
//   fs.writeFile("sms.txt", sms, function (err) {
//     if (err) return console.log(err);
//     console.log("Written sms.txt");
//   });
// };
