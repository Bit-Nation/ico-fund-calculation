//Deps
const express = require('express');
const app = express();
const ethers = require('ethers');
const BigNumber = require('big.js');
const winston = require('winston');
require('winston-papertrail').Papertrail;

const SALE_ADDRESS = process.env.SALE_ADDRESS;
const MULTISIG_ADDRESS = process.env.MULTISIG_ADDRESS;
const JSON_RPC_URL = process.env.JSON_RPC_URL;

const ethersProvider = new ethers.providers.JsonRpcProvider(JSON_RPC_URL);

//Set CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

//Logger
const logger = new winston.Logger({
    transports: [
        new winston.transports.Papertrail({
            host: process.env.PAPERTRAIL_HOST,
            port: process.env.PAPERTRAIL_PORT,
            colorize: true,
            hostname: process.env.PAPERTRAIL_HOST_NAME
        })
    ]
});

//Catch errors
app.use(function (err, req, res, next) {
    logger.error(err);
    res.status(500);
    res.send();
});

//Calc collected funds
app.get('/', function (req, res) {

    let investedEth;

	ethersProvider
        .getBalance(SALE_ADDRESS)
        .then(function (amount) {
        	investedEth = amount;
        	return ethersProvider.getBalance(MULTISIG_ADDRESS);
        })
        .then(function (amount) {
            investedEth = investedEth.add(amount);
            investedEth = investedEth.toString(10);
            investedEth = new BigNumber(ethers.utils.formatUnits(investedEth, 'ether'));

            res.send({
                collected_eth: investedEth.toFixed(3)
            })
        })
        .catch(function (e) {
            throw e
        })

});

app.listen(process.env.PORT || 3000, function(){
    console.log("started server")
});
