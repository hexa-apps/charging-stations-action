const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();

// const emptyChar = "⠀";

// fetch("http://udim.koeri.boun.edu.tr/zeqmap/xmlt/son24saat.xml")
//   .then((res) => res.text())
//   .then((res) => evalRes(res))
//   .catch((err) => console.log(err));

// let comparer = (otherArray) => {
//   return function (current) {
//     return (
//       otherArray.filter(function (other) {
//         return other.date === current.date;
//       }).length == 0
//     );
//   };
// };

// let evalRes = (res) => {
//   const $ = cheerio.load(res, { xmlMode: true });
//   const earthquakesDOM = getEarthquakesDOM($);
//   const networkEarthquakes = createEarthquakesArray($, earthquakesDOM);
//   readLocalFileEarthquakes()
//     .then((strLocalEarthquakes) => {
//       const localEarthquakes = JSON.parse(strLocalEarthquakes);
//       const newEarthquakes = networkEarthquakes.filter(
//         comparer(localEarthquakes)
//       );
//       console.log("newEarthquakes", newEarthquakes);
//       const earthquakes = getEarthquakesBySelectedCriteria(newEarthquakes);
//       console.log("earthquakes", earthquakes);
//       // const smsText = createSmsText(earthquakes);
//       sendNewEarthQuakesTweets(earthquakes);
//       writeEarthquakesToFile(networkEarthquakes);
//       // if (smsText.length === 0) {
//       if (earthquakes.length === 0) {
//         console.log("Earthquake not happened");
//         writeTweetToFile("Earthquake not happened");
//         return;
//       }
//       // writeSmsToFile(smsText);
//     })
//     .catch((err) => console.log(err));
// };

// let sendNewEarthQuakesTweets = (earthquakes) => {
//   earthquakes.forEach((earthquake) => {
//     sendNotification(earthquake);
//     // sendTweet(createTweetText(earthquake));
//     // sendTweet(createTweetText(earthquake), generateImageUrl(earthquake));
//   });
// };

// let getEarthquakesDOM = ($) => {
//   return $("earhquake");
// };

// let createEarthquakesArray = ($, earthquakesDOM) => {
//   let earthquakes = [];
//   earthquakesDOM.each((index, earthquake) => {
//     earthquakes.push(createEarthQuakeObj($, earthquake));
//   });
//   return earthquakes;
// };

// let createEarthQuakeObj = ($, earthquake) => {
//   const date = $(earthquake).attr("name").trim();
//   const location = $(earthquake).attr("lokasyon").replace(/\s\s+/g, " ").trim();
//   const lat = $(earthquake).attr("lat").trim();
//   const lng = $(earthquake).attr("lng").trim();
//   const mag = $(earthquake).attr("mag").trim();
//   const depth = $(earthquake).attr("Depth").trim();
//   return { date, location, lat, lng, mag, depth };
// };

let writeStationsToFile = (city, stations) => {
  fs.writeFile(city + ".json", JSON.stringify(stations), function (err) {
    if (err) return console.log(err);
    console.log("Written " + city + ".json");
  });
};

const result = async function () {
  const urls = [
    {
      url: "https://veri.tuzla.bel.tr/api/3/action/datastore_search?resource_id=0c894436-db88-44ea-bf15-d7b2e51b5509&limit=500",
      city: "istanbul",
      district: "tuzla",
    },
    {
      url: "https://veri.kocaeli.bel.tr/tr/dataset/9021334f-358b-4a1a-9f4f-76592ca07541/resource/f853e162-8895-47e8-8bcf-e1b8796f1cf1/download/akulu-sandalye-arj-istasyonu.json",
      city: "kocaeli",
    },
    {
      url: "https://acikveri.bizizmir.com/api/3/action/datastore_search?resource_id=028f2692-d930-481f-ab27-17a321bd1283&limit=500",
      city: "izmir",
    },
    {
      url: "https://opendata.gaziantep.bel.tr/api/3/action/datastore_search?resource_id=a9b86fc1-af55-41ca-984e-164c161c14d3&limit=500",
      city: "gaziantep",
    },
  ];
  const stations = { type: "FeatureCollection", features: [] };
  for (let i = 0; i < urls.length; i++) {
    const { url, city, district } = urls[i];
    const res = await fetch(url).catch((err) => err);
    if (res instanceof Error) {
      console.log("error", city);
      continue;
    }
    const json = await res.json();
    if (json) {
      if (city === "istanbul" && district === "tuzla") {
        stations.features = stations.features.concat(
          json.result.records.map((station) => {
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [station.BOYLAM, station.ENLEM],
              },
              properties: {
                name: station["ENGELLI ARACI SARJ ISTASYONLARI"],
                address: station.ADRES,
                city,
              },
            };
          })
        );
      } else if (city === "kocaeli") {
        stations.features = stations.features.concat(
          json.features.map((station) => {
            return {
              type: station.type,
              geometry: station.geometry,
              properties: {
                name: station.properties.adi,
                address: station.properties.adres,
                city,
              },
            };
          })
        );
      }
    }
  }
  writeStationsToFile("stations", stations);
};

result();

// const readFile = async (filePath) => {
//   try {
//     const data = await fs.promises.readFile(filePath, "utf8");
//     return data;
//   } catch (err) {
//     console.log(err);
//   }
// };

// let readLocalFileEarthquakes = () => {
//   return readFile("previousEarthquakes.json");
// };

// const getEarthquakesBySelectedCriteria = (newEarthquakes) => {
//   const foundEarthquakes = [];
//   const cities = process.env.CITIES_DELIMITED_WITH_SEMICOLON.split(";");
//   const minMagnitude = process.env.MIN_MAGNITUDE;
//   // newEarthquakes.forEach((earthquake) => {
//   //   cities.forEach((city) => {
//   //     if (
//   //       (city === "*" || earthquake.location.includes(city)) &&
//   //       earthquake.mag >= minMagnitude
//   //     ) {
//   //       foundEarthquakes.push(earthquake);
//   //     }
//   //   });
//   // });
//   newEarthquakes.forEach((earthquake) => {
//     // if(earthquake.mag >= minMagnitude) {
//       foundEarthquakes.push(earthquake);
//     // }
//   });
//   return foundEarthquakes;
// };

// // let createTweetText = (earthquake) => {
// //   let date = earthquake.date;
// //   if (date.includes(" ")) {
// //     date = date.split(" ")[1];
// //   }
// //   return `#Deprem\n#HAZTURK\nBüyüklük: ${earthquake.mag}\nKonum: ${earthquake.location}\nZaman: ${date}\nDerinlik: ${earthquake.depth} km\nEnlem: ${earthquake.lat}°\nBoylam: ${earthquake.lng}°\n\nhttps://rebrand.ly/HAZTURK`;
// // };

// let writeTweetToFile = (tweet) => {
//   fs.writeFile("tweet.txt", tweet, function (err) {
//     if (err) return console.log(err);
//     console.log("Written tweet.txt");
//   });
// };

// let sendNotification = (earthquake) => {
//   const restKey = process.env.OS_REST_KEY;
//   const appId = process.env.OS_APP_ID;
//   let includedSegments = ["allmag"]
//   if (earthquake.mag >= 2.5) {
//     includedSegments.push("twofivemag");
//   } else if (earthquake.mag >= 4.5) {
//     includedSegments.push("fourfivemag");
//   }
//   fetch(
//     "https://onesignal.com/api/v1/notifications",
//     {
//       method: "POST",
//       headers: {
//         "Authorization": "Basic " + restKey,
//         "Content-Type": "application/json",
//       },
//       // json: true,
//       body: JSON.stringify({
//         app_id: appId,
//         included_segments: includedSegments,
//         contents: { en: `${earthquake.mag}-${earthquake.location}` },
//         headings: { en: "DEPREM" },
//         data: {
//           date: earthquake.date,
//           location: earthquake.location,
//           lat: earthquake.lat,
//           lng: earthquake.lng,
//           mag: earthquake.mag,
//           depth: earthquake.depth,
//         },
//     }),
//   })
//     .then((response) => console.log("Sent", response.text))
//     .catch((error) => console.log("Sending error", error));
//   writeTweetToFile(`${earthquake.mag}-${earthquake.location}`);
// };

// let sendTweet = (tweetText, imageUrl) => {
//   const webhookKey = process.env.IFTTT_WEBHOOKS_KEY;
//   const iftttEventName = process.env.IFTTT_EVENT;
//   fetch(
//     `https://maker.ifttt.com/trigger/${iftttEventName}/with/key/${webhookKey}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         "value1": tweetText,
//         // "value1" : imageUrl,
//         // "value2" : tweetText
//       }),
//     }
//   )
//     .then((response) => console.log("Sent", response.text))
//     .catch((error) => console.log("Sending error", error));
//   writeTweetToFile(tweetText);
// };
