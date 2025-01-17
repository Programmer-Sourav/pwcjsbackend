// netlify/functions/countries.js

const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    const response = await axios.get('https://restfulcountries.com/api/v1/countries');
    const countries = response.data;

    return {
      statusCode: 200,
      body: JSON.stringify({ countries }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching countries'.error }),
    };
  }
};
