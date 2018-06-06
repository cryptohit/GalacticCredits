const GACR = artifacts.require("./GACR.sol");

module.exports = function(deployer) {

    const cap = new web3.BigNumber(50000000e18); // max 50,000,000 GACR
    deployer.deploy(GACR, cap);
};
