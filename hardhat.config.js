require('module-alias/register');

const {
    debugLog,
    loadInfinityMint,
    prepareConfig,
    saveGlobalSessionFile,
    readGlobalSession,
    hasNodeModule,
} = require('infinitymint/dist/app/helpers');
//create the default pipe
const { createDefaultFactory } = require('infinitymint/dist/app/pipes');

//set as javascript session
let session = readGlobalSession();
session.environment.javascript = true;
saveGlobalSessionFile(session);

//Create Default Factory
createDefaultFactory();

//require dotenv if it exists
if (hasNodeModule('dotenv')) {
    logDirect('🧱 Loading .env file');
    require('dotenv').config({
        override: false, //will not override already established environment variables
    });
}

//import our hardhat plugins
require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-ethers');
require('hardhat-change-network'); //allows hre.changeNetwork to occur

//load infinitymint
loadInfinityMint(true);

//return the infinitymint config file
let config = prepareConfig();
debugLog('loaded hardhat.config.js');
module.exports = config.hardhat; //export the infinity mint configuration file
