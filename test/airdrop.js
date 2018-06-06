const assert = require('assert');

const Airdrop = artifacts.require('./Airdrop.sol');
const CappedToken = artifacts.require('./GACR.sol');

contract('Airdrop', accounts => {
    let contract;
    const owner = accounts[0];

    beforeEach(async () => {
        // contract = await Airdrop.new();
    });

    describe('multisend()', () => {
        let airdropInstance = null;
        let cappedTokenInstance = null;

        before(async () => {
            cappedTokenInstance = await CappedToken.deployed();
            airdropInstance = await Airdrop.deployed();
        });

        it('should get total supply of tokens', async () => {
            const totalSupply = await cappedTokenInstance.totalSupply.call();
            //console.log('totalSupply=' + totalSupply);
            assert(totalSupply.eq(0));
        });

        it('should get owner of contracts', async () => {
            const tokenOwner = await cappedTokenInstance.owner.call();
            const airdropOwner = await airdropInstance.owner.call();
            //console.log('tokenOwner=' + tokenOwner);
            //console.log('airdropOwner=' + airdropOwner);
            assert.equal(tokenOwner, owner);
            assert.equal(airdropOwner, owner);
        });

        it('should get cap of token', async () => {
            const cap = await cappedTokenInstance.cap.call();
            //console.log('cap=' + cap);
            assert(cap.eq(new web3.BigNumber('50000000e18')));
        });

        it('should deploy airdrop contract', async () => {
            assert(airdropInstance);
        });

        it('should airdrop tokens to addresses', async () => {
            const dests = [accounts[1], accounts[2]];
            const value = 100;

            //console.log(`Airdrop address: ${airdropInstance.address}`);
            //console.log(`Capped token address: ${cappedTokenInstance.address}`);
            //console.log(`Destination addresses: ${dests}`);
            //console.log(`Value: ${value}`);

            let result = await cappedTokenInstance
                .transferOwnership(airdropInstance.address);

            result = await airdropInstance
                .multisend(
                    cappedTokenInstance.address,
                    dests,
                    value,
                    // { from: owner },
                );
            assert(result);
        });
    });
});