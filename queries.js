const axios = require('axios');
const Pool = require('pg').Pool;
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
// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'postgres',
//     password: 'amin666',
//     port: 5432,
// })
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
    if (hours <= 9) {
        hours = '0' + date_ob.getHours();
    }

    // current minutes
    minutes = date_ob.getMinutes();
    if (minutes <= 9) {
        minutes = '0' + date_ob.getMinutes();
    }

    // current seconds
    seconds = date_ob.getSeconds();
    if (seconds <= 9) {
        seconds = '0' + date_ob.getSeconds();
    }

    setTimeout(timer, 1000);
}
timer();

const createSignals = async (request, response) => {
    const { type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, sl_percent, sl_price, sl_active, tp_active, status, open_position = "open_position", close_position = "close_position", long = "open_long", short = "open_short", datatime = (year + "-" + month + "-" + date), currenthours = (hours + ":" + minutes + ":" + seconds) } = request.body;

    if (request.body.type === "open_short") {
        pool.query(
            'INSERT INTO signals (type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, status, date_start, hours_start) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, open_position, datatime, currenthours],
            (error, results) => {
                if (error) {
                    console.error(error);
                    response.status(500).send('Error creating signal');
                } else {
                    response.status(200).send('Signal created');
                    const symbolParts = request.body.symbol.split('USDT.PS');
                    const transformedSymbol = symbolParts.join('-USDT').toUpperCase();
                    const symbolname = transformedSymbol;
                    const tpprice = request.body.tp_price
                    const slprice = request.body.sl
                    console.log(symbolname)
                    console.log(tpprice)
                    console.log(slprice)
                    bingx
                        .setLeverage({
                            symbol: symbolname,
                            side: "Short",
                            leverage: "1",
                        })
                        .then((data) => console.log(data));

                    bingx.getPrice({ symbol: symbolname })
                        .then((result) => {
                            const data = result.data;
                            const totalPrice = result.totalPrice;
                            const leverage = result.Leverage.data.shortLeverage; //result.Leverage.data.longLeverage
                            console.log(leverage)
                            const volPrice = (totalPrice.data.account.balance / 100) * leverage
                            const tradePrice1 = data.data.tradePrice;
                            const tradePrice = tradePrice1 - (tradePrice1 / 10000)
                            const entrustVolume = volPrice / tradePrice
                            console.log(tradePrice)
                            console.log(volPrice)
                            console.log(entrustVolume)
                            bingx.placeOrder({
                                symbol: symbolname,
                                side: "Ask",
                                entrustPrice: tradePrice,
                                entrustVolume: entrustVolume,
                                tradeType: "Limit",
                                action: "Open",
                                takerProfitPrice: tpprice,
                                stopLossPrice: slprice,
                            })
                                .then((data) => {
                                    console.log(data);
                                    console.log(data.code);
                                    if (data.code === 0) {
                                        console.log(data.data.orderId)
                                    }
                                    if (data.code != 0) {
                                        console.log(data.msg)
                                    }
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
            }

        );
    } else if (request.body.type === "open_long") {
        pool.query(
            'INSERT INTO signals (type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, status, date_start, hours_start) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy, open_position, datatime, currenthours],
            (error, results) => {
                if (error) {
                    console.error(error);
                    response.status(500).send('Error creating signal');
                } else {
                    response.status(200).send('Signal created');
                    const symbolParts = request.body.symbol.split('USDT.PS');
                    const transformedSymbol = symbolParts.join('-USDT').toUpperCase();
                    const symbolname = transformedSymbol;
                    const tpprice = request.body.tp_price
                    const slprice = request.body.sl
                    bingx
                    .setLeverage({
                      symbol: symbolname,
                      side: "Long",
                      leverage: "1",
                    })
                  .then((data) => console.log(data));
          
                  bingx.getPrice({ symbol: symbolname })
                    .then((result) => {
                      const data = result.data;
                      const totalPrice = result.totalPrice;
                      const leverage = result.Leverage.data.longLeverage; //result.Leverage.data.longLeverage
                      console.log(leverage)
                      const volPrice = (totalPrice.data.account.balance / 100) * leverage
                      const tradePrice1 = data.data.tradePrice;
                      const tradePrice = tradePrice1 * 1.0001
                      const entrustVolume = volPrice / tradePrice
                      console.log(tradePrice)
                      console.log(volPrice)
                      console.log(entrustVolume)
                      bingx.placeOrder({
                        symbol: symbolname,
                        side: "Bid",
                        entrustPrice: tradePrice,
                        entrustVolume: entrustVolume,
                        tradeType: "Limit",
                        action: "Open",
                        takerProfitPrice: tpprice,
                        stopLossPrice: slprice,
                      })
                        .then((data) => {
                          console.log(data);
                          console.log(data.code)
                          if (data.code === 0) {
                            console.log(data.data.orderId)
                          }
                          if (data.code != 0) {
                            console.log(data.msg)
                          }
          
                        })
                        .catch((error) => {
                          console.error(error);
                        });
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                }
            }
        );
    } else if (request.body.type == 'close_long' && request.body.sl_price != undefined) {
        pool.query(
            'UPDATE signals SET sl_price = $1, sl_percent = $2, sl_active = true, status = $5, date_end = $7, hours_end = $8  WHERE symbol = $3 and status = $4 and type = $6 ',
            [
                sl_price,
                sl_percent,
                symbol,
                open_position,
                close_position,
                long,
                datatime,
                currenthours,
            ],
            (error, results) => {
                if (error) {
                    throw error;
                }
                const symbolParts = request.body.symbol.split('USDT.PS');
                const transformedSymbol = symbolParts.join('-USDT').toUpperCase();
                const symbolname = transformedSymbol;
                bingx.closePositionBySymbol(symbolname).then((data) => console.log(data));
                response.status(200).send('OK');
            }
        );
    } else if (
        request.body.type == 'close_long' &&
        request.body.sl_price == undefined &&
        request.body.sl == undefined
    ) {
        pool.query(
            'UPDATE signals SET tp_active = true, status = $3, date_end = $5, hours_end = $6  WHERE symbol = $1 and status = $2 and type = $4 and tp_price = $7 ',
            [symbol, open_position, close_position, long, datatime, currenthours, tp_price],
            (error, results) => {
                if (error) {
                    throw error;
                }
                response.status(200).send('OK');
            }
        );
    } else if (request.body.type == 'close_short' && request.body.sl_price != undefined) {
        pool.query(
            'UPDATE signals SET sl_price = $1, sl_percent = $2, sl_active = true, status = $5, date_end = $7, hours_end = $8  WHERE symbol = $3 and status = $4 and type = $6',
            [
                sl_price,
                sl_percent,
                symbol,
                open_position,
                close_position,
                short,
                datatime,
                currenthours,
            ],
            (error, results) => {
                if (error) {
                    throw error;
                }
                const symbolParts = request.body.symbol.split('USDT.PS');
                const transformedSymbol = symbolParts.join('-USDT').toUpperCase();
                const symbolname = transformedSymbol;
                console.log(symbolname)
                bingx.closePositionBySymbol(symbolname).then((data) => console.log(data));
                response.status(200).send('OK');
            }
        );
    } else if (
        request.body.type == 'close_short' &&
        request.body.sl_price == undefined &&
        request.body.sl == undefined
    ) {
        pool.query(
            'UPDATE signals SET tp_active = true, status = $3, date_end = $5, hours_end = $6  WHERE symbol = $1 and status = $2 and type = $4 and tp_price = $7 ',
            [symbol, open_position, close_position, short, datatime, currenthours, tp_price],
            (error, results) => {
                if (error) {
                    throw error;
                }
                response.status(200).send('OK');
            }
        );
    } else {
        response.status(200).send('Comment not true');
    }
};

module.exports = {
    createSignals,
};