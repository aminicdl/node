const Pool = require('pg').Pool
const BingX = require('./bingx');
require("dotenv").config();
const bingx = new BingX(
  process.env.BINGX_API_KEY,
  process.env.BINGX_SECRET_KEY
);

const pool = new Pool({
    user: 'amin',
    host: 'dpg-ch74bmbhp8u9bo5253h0-a',
    database: 'webhook_1qtv',
    password: 'tizfPXhsbgmwDW8ySfUYWjThhTbKnQFX',
    port: 5432,
    ssl: false,
})

function timer() {

  let date_ob = new Date();

// current date
// adjust 0 before single digit date
  date = ("0" + date_ob.getDate()).slice(-2);

// current month
  month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
  year = date_ob.getFullYear();

  hours = date_ob.getHours();
  if (hours <= 9){
    hours = '0' + date_ob.getHours();
  }

// current minutes
  minutes = date_ob.getMinutes();
  if (minutes <= 9){
    minutes = '0'+ date_ob.getMinutes();  
  } 

// current seconds
  seconds = date_ob.getSeconds();
  if (seconds <= 9){
    seconds = '0'+ date_ob.getSeconds();  
  }
    
  setTimeout(timer, 1000)
}
timer()

const createSignals = (request, response) => {
  const { type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy , sl_percent, sl_price, sl_active, tp_active, status, open_position = "open_position" , close_position = "close_position", long = "open_long" , short = "open_short" , datatime = (year + "-" + month + "-" + date), currenthours = (hours + ":" + minutes + ":" + seconds) } = request.body
 
  if (request.body.type == "open_short") {
    pool.query('INSERT INTO signals (type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, status, date_start , hours_start) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ', [type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, open_position, datatime, currenthours  ], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`User added with ID: ${id}`)
      response.status(200).send(`OK`)
    })
  }
  if (request.body.type == "open_long") {
    pool.query('INSERT INTO signals (type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, status, date_start , hours_start) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ', [type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, open_position, datatime, currenthours], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`User added with ID: ${id}`)
      response.status(200).send(`OK`)
    })
  }
  if (request.body.type == "close_long" && request.body.sl_price != undefined) {

    pool.query('UPDATE signals SET sl_price = $1, sl_percent = $2 , sl_active = true, status = $5 , date_end = $7 , hours_end = $8  WHERE symbol = $3 and status = $4 and type = $6 ', [sl_price, sl_percent, symbol, open_position, close_position, long, datatime, currenthours], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`User added with ID: ${id}`)  ///////////        SL long
      const transformedResult = result.rows.map(row => {
        const symbolParts = row.symbol.split('USDT.PS');
        const transformedSymbol = symbolParts.join('-USDT').toUpperCase();
        return { symbol: transformedSymbol };
      });
      console.log(transformedResult[0].symbol);
      const symbolname = transformedResult[0].symbol;
      
      bingx.closePositionBySymbol(symbolname) .then((data) => console.log(data));
      response.status(200).send(`OK`)
    })
  }
  if (request.body.type == "close_long" && request.body.sl_price == undefined && request.body.sl == undefined) {
    pool.query('UPDATE signals SET tp_active = true, status = $3 , date_end = $5 , hours_end = $6  WHERE symbol = $1 and status = $2 and type = $4 ', [symbol, open_position, close_position, long, datatime, currenthours], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`User added with ID: ${id}`) ///////////////       TP long
      response.status(200).send(`OK`)
    })
  }
  if (request.body.type == "close_short" && request.body.sl_price != undefined) {
    pool.query('UPDATE signals SET sl_price = $1, sl_percent = $2 , sl_active = true, status = $5 , date_end = $7 , hours_end = $8  WHERE symbol = $3 and status = $4 and type = $6', [sl_price, sl_percent, symbol, open_position, close_position, short, datatime, currenthours], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`User added with ID: ${id}`)  ///////////        SL short
      const transformedResult = result.rows.map(row => {
        const symbolParts = row.symbol.split('USDT.PS');
        const transformedSymbol = symbolParts.join('-USDT').toUpperCase();
        return { symbol: transformedSymbol };
      });
      console.log(transformedResult[0].symbol);
      const symbolname = transformedResult[0].symbol;
      
      bingx.closePositionBySymbol(symbolname) .then((data) => console.log(data));
      response.status(200).send(`OK`)
    })
  }
  if (request.body.type == "close_short" && request.body.sl_price == undefined && request.body.sl == undefined) {
    pool.query('UPDATE signals SET tp_active = true, status = $3 , date_end = $5 , hours_end = $6  WHERE symbol = $1 and status = $2 and type = $4', [symbol, open_position, close_position, short, datatime, currenthours], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`User added with ID: ${id}`) ///////////////       TP short
      response.status(200).send(`OK`)
    })
  }

  if ((request.body.type != "close_long" && request.body.type != "close_short" && request.body.type != "open_long" && request.body.type != "open_short")) {
    response.status(200).send(`comment not true`)
  }
 
  console.log(request.body)
}



module.exports = {
    createSignals,
  }