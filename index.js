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
app.get("/countries", async (req, res) => {
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
        res.json(cachedResult.data);
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

      res
        .status(200)
        .json({ message: "Found Country details", countries: copiedData });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Something went wrong, please try again later." });
    }
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

app.get("/countries/region/:region", async (req, res) => {
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

app.get("/countries/search", async (req, res) => {
  const countryName = req.query.name;

  let remoteUrl = `https://restcountries.com/v3.1/name/${countryName}`;

  try {
    const response = await axios.get(remoteUrl);
    const data = response.data;
    res.status(200).json({ message: "Countries by Name", countries: data[0] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
});

app.get("/countries/search/capital", async (req, res) => {
  const capitalName = req.query.capital;

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

app.get("/countries/search/region", async (req, res) => {
  const regionName = req.query.region;

  let remoteUrl = `https://restcountries.com/v3.1/region/${regionName}`;

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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
