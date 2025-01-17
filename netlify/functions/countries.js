// netlify/functions/countries.js
const axiosRetry = require('axios-retry');
const axios = require('axios');

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

exports.handler = async function(event, context) {
  try {
    const apiKey = '1942|phnty85UIaRSyFV1arPJEPOw7ni2cL5qHKPPvBN1';

    const response = await axios.get('https://restcountries.com/v3.1/all', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      timeout: 10000,  // Set timeout if necessary
    });

    const countries = response.data;
    return {
      statusCode: 200,
      body: JSON.stringify(countries),
    };
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching countries', error: error.message }),
    };
  }
};


