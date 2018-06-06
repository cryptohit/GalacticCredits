const Airdrop = artifacts.require('./Airdrop.sol');

module.exports = (deployer) => {
    deployer.deploy(Airdrop);
};