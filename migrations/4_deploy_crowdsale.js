const GACR = artifacts.require("./GACR.sol");
const Crowdsale = artifacts.require("./Crowdsale.sol");

module.exports = function(deployer, network, accounts) {

    const token_cap = new web3.BigNumber(50000000e18);  // max 50,000,000 GACR
    const eth_cap  = new web3.BigNumber(71250e18);  // max 71,250 ETH ~ 28,500,000 GACR
    const rate = new web3.BigNumber(400);       // 1 GACR = 0.0025 ETH (or 1 ETH = 400 GACR)
    let wallet = "ACCOUNT_ADDRESS";             // todo: address where funds are collected

    if (network == "rinkeby") {
        wallet    = "0x87b9554120606e202a73d7e0a1722bcadc1b80d9";   // address where funds are collected
    } else if (network == "development") {
        wallet = accounts[9];
    }

    deployer.deploy(GACR, token_cap).then(function () {
        console.log('Address GACR :' + GACR.address);
    });

    deployer.deploy(Crowdsale, eth_cap, rate, wallet, GACR.address).then(function () {
        console.log('Address Crowndsale :' + Crowdsale.address);
    });

};