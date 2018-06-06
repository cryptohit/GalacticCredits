const Crowdsale = artifacts.require("./Crowdsale.sol");

module.exports = function(deployer, network, accounts) {

    const cap  = new web3.BigNumber(71250e18);  // max 71,250 ETH ~ 28,500,000 GACR
    const rate = new web3.BigNumber(400);       // 1 GACR = 0.0025 ETH (or 1 ETH = 400 GACR)
    let wallet = "ACCOUNT_ADDRESS";             // todo: address where funds are collected

    if (network == "rinkeby") {
        wallet    = "ACCOUNT_ADDRESS";          // todo: address where funds are collected
    } else if (network == "development") {
        wallet = accounts[9];

    }

    deployer.deploy(Crowdsale, cap, rate, wallet);
};