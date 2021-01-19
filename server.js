const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());

let companies = [];
const getData = async (url) => {
  const response = await fetch(url);
  const data = await response.text();
  return data.split('\n');
};
const init = async () => {
  const temp = await getData('https://s3.amazonaws.com/quandl-production-static/end_of_day_us_stocks/ticker_list.csv');
  const names = temp.map((item) => item.split(','));
  const tickers = await getData('https://s3.amazonaws.com/quandl-production-static/coverage/WIKI_PRICES.csv');
  companies = tickers.map((item) => {
    const company = names.find((row) => row[0] === item);
    return { ticker: item, name: company ? company[2] : '' };
  });
};
init();
app.get('/tickers', (req, res) => {
  res.send(companies);
});
app.get('/eod/:ticker', (req, res) => {
  let url = `https://www.quandl.com/api/v3/datatables/WIKI/PRICES.json?ticker=${req.params.ticker}&api_key=VSAemYjRCH6kkDJN8Gu5`;
  Object.keys(req.query).forEach((key) => {
    url = `${url}&${key}=${req.query[key]}`;
  });
  https.get(url, (response) => {
    response.pipe(res);
  });
});

app.listen(3030);
