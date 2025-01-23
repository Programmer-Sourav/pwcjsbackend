const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

const cache = new Map();
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

app.get("/", (req, res) => {
  res.json("Hello from nodejs");
});
app.get("/countries/:start/:end", async (req, res) => {

  const startIndex = req.params.start;
  const endIndex = req.params.end;

  const apiKeyToken = "1942|phnty85UIaRSyFV1arPJEPOw7ni2cL5qHKPPvBN1";
  const code = apiKeyToken;
  const cacheKey = `${code}`;
  const cachedResult = cache.get(cacheKey);

  if (!code) {
    res.json({ statusCode: 400, message: "API Key not found" });
  } else {
    if (cachedResult) {
      const currentTime = Date.now();
      const lastTime = cachedResult.timestamp;
      if (currentTime - lastTime < CACHE_EXPIRATION_TIME) {
        const filteredData = cachedResult.data.filter((copiedItem)=>copiedItem.id>=startIndex && copiedItem.id<=endIndex)
        res.json(filteredData);
        return;
      } else {
        cache.delete(cacheKey);
      }
    }

    let remoteUrl = `https://restfulcountries.com/api/v1/countries`;

    try {
      const response = await axios.get(remoteUrl, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiKeyToken}`,
        },
      });
      const data = response.data;
      let copiedData = [];
      for (let i = 0; i < data.data.length; i++) {
        console.log(444, data[i])
        const item = { id: i+1, country: data.data[i] };
        copiedData.push(item); 
        // Add the new object to copiedData
      }

      cache.set(cacheKey, { data: copiedData, timestamp: Date.now() });
      const filteredData = copiedData.filter((copiedItem)=>copiedItem.id>=startIndex && copiedItem.id<=endIndex)
      
      res
        .status(200)
        .json({ message: "Found Country details", countries: filteredData });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Something went wrong, please try again later." });
    }
  }
});

app.get("/countries/search/:region", async (req, res) => {
  const regionName = req.params.region;
  console.log(2222, regionName);
  let remoteUrl = `https://restcountries.com/v3.1/region/${regionName}`;
  console.log(3333, remoteUrl);
  try {
    const response = await axios.get(remoteUrl);
    const data = response.data;
    res
      .status(200)
      .json({ message: "Countries by Region", countries: data[0] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
});

// app.get('/countries/search', checkQueryAndCallAPI, (req, res) => {
//   // Send the response from the external API to the client
//   res.json(req.apiResponse);
// });

async function checkQueryAndCallAPI(req, res, next) {
  const searchParams = req.query;  // Get query parameters from the request
  const baseUrl = "http://35.173.230.235:3000/countries/search";
  
  // Build URL based on the query parameter (region or name)
  let url = baseUrl;
  if (searchParams.region) {
      url += `?region=${searchParams.region}`;
  } else if (searchParams.name) {
      url += `?capital=${searchParams.capital}`;
  } else {
      return res.status(400).json({ error: "Either 'region' or 'name' must be provided." });
  }

  try {
      // Call the external API with the constructed URL
      const response = await axios.get(url);
      
      // Attach the API response to the request object and move to the next middleware
      req.apiResponse = response.data;
      ///const data = response.data;
      //res.status(200).json({ message: "Countries by Region", countries: data[0] });
      next();  // Proceed to the next middleware/handler
  } catch (error) {
      console.error("Error making API request:", error);
      return res.status(500).json({ error: "Error contacting the external API" });
  }
}

app.get("/countries/search", async (req, res) => {
  const countryName = req.query.name;
  console.log(11111, countryName);
  let remoteUrl = `https://restcountries.com/v3.1/name/${countryName}`;
    console.log(2222, remoteUrl);
  try {
    const response = await fetch(remoteUrl);
    const data = await response.json();
    console.log(3333, data);
    console.log(4444, data[0]);
    res.status(200).json({ message: "Countries by Name", countries: data[0] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
});

app.get("/countries/:code", async (req, res) => {
  const code = req.params.code;
  const cacheKey = `${code}`;
  const cachedResult = cache.get(cacheKey);

  if (!code) {
    res.json({ statusCode: 400, message: "Country Code not found" });
  } else {
    if (cachedResult) {
      const currentTime = Date.now();
      const lastTime = cachedResult.timestamp;
      if (currentTime - lastTime < CACHE_EXPIRATION_TIME) {
        res.json(cachedResult.data);
        return;
      } else {
        cache.delete(cacheKey);
      }
    }

    let remoteUrl = `https://restcountries.com/v3.1/alpha/${code}`;

    try {
      const response = await axios.get(remoteUrl);
      const data = response.data;
      cache.set(cacheKey, { data: data[0], timestamp: Date.now() });
      res
        .status(200)
        .json({ message: "Found Country details by code", countries: data[0] });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Something went wrong, please try again later." });
    }
  }
});

app.get("/countries/search/region/:region", async (req, res) => {
  const region = req.params.region;
  const name = req.params.name;

  if (!region) {
    res.json({ statusCode: 400, message: "Region not found" });
  } else {
    let remoteUrl = `https://restcountries.com/v3.1/region/${region}`;

    const cacheKey = `${name}-${region}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      const currentTime = Date.now();
      if (currentTime - cachedResult.timestamp < CACHE_EXPIRATION_TIME) {
        console.log("Serving from cache");
        res.json(cachedResult.data);
        return;
      } else {
        cache.delete(cacheKey);
      }
    }

    try {
      const response = await axios.get(remoteUrl);
      const data = response.data;
      cache.set(cacheKey, { data: data[0], timestamp: Date.now() });
      res
        .status(200)
        .json({ message: "Countries by Region", countries: data[0] });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Something went wrong, please try again later." });
    }
  }
});



app.get("/countries/search/capital/:capital", async (req, res) => {
  const capitalName = req.params.capital;

  let remoteUrl = `https://restcountries.com/v3.1/capital/${capitalName}`;

  try {
    const response = await axios.get(remoteUrl);
    const data = response.data;
    res
      .status(200)
      .json({ message: "Countries by Capital", countries: data[0] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
