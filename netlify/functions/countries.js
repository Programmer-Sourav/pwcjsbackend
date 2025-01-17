// netlify/functions/countries.js

const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    const apiKey = "1942|phnty85UIaRSyFV1arPJEPOw7ni2cL5qHKPPvBN1";  // Ensure you have this in your environment variables

    const response = await axios.get('https://restcountries.com/v3.1/all', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',  // Other headers may be needed depending on the API
      },
    });

    const countries = response.data;
    return {
      statusCode: 200,
      body: JSON.stringify(countries),
    };
  } catch (error) {
    console.error('Error fetching countries:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching countries', error: error.message }),
    };
  }
};

