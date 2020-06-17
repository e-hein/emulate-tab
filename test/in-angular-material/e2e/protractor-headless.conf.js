const config = require('./protractor.conf').config;
config.capabilities.chromeOptions = { args: [ "--headless", "--disable-gpu", "--window-size=1920,1080"] },
exports.config = config;
