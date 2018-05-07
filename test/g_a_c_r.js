var GACR = artifacts.require("./GACR.sol");
const assert = require('assert');

contract('GACR', accounts => {

    let token;
    const creator = accounts[0];

    beforeEach(async () => {
        token = await GACR.new({ from: creator });
    });

    it('has a name', async function () {
        const name = await token.name();
        assert.equal(name, 'Galactic Credits');
    });

    it('has a symbol', async function () {
        const symbol = await token.symbol();
        assert.equal(symbol, 'GACR');
    });

    it('has 18 decimals', async function () {
        const decimals = await token.decimals();
        assert(decimals.eq(18));
    });

    it('has a cap of 50,000,000 tokens', async function () {
        const cap = await token.cap();
        assert(cap.eq(new web3.BigNumber('50000000e18')));
    });

    describe('mint()', () => {

        const to = accounts[1];
        const amount = web3.fromWei('500000e18', 'ether');
        let instance = null;
        let result = null;

        before(async () => {
            instance = await GACR.deployed();
            result = await instance.mint(to, amount);
        });

        it('should mint tokens for test', async () => {
            assert(result);
        });

        it('should fire events for Mint and Transfer', async () => {
            assert.equal(result.logs[0].event, 'Mint');
            assert.equal(result.logs[1].event, 'Transfer');
        });

        it('should update total supply of tokens', async () => {
            const totalSupply = await instance.totalSupply.call();
            assert(totalSupply.eq(amount));
        });

        it('should update token balance for test', async () => {
            const balance = await instance.balanceOf.call(accounts[1]);
            assert(balance.eq(amount));
        });

    });

    describe('send()', () => {

        const account_one = accounts[0];
        const account_two = accounts[1];
        const amount = web3.fromWei('500000e18', 'ether');
        let instance = null;
        let result = null;

        before(async () => {
            instance = await GACR.deployed();
            result = await instance.mint(account_one, amount);
        });

        it("should send coin correctly", async () => {

            let transferAmt = 10000;

            let balance = await instance.balanceOf.call(account_one);
            let acc_one_before = balance.toNumber();

            balance = await instance.balanceOf.call(account_two);
            let acc_two_before = balance.toNumber();
            await instance.transfer(account_two, transferAmt, {from: account_one});

            balance = await instance.balanceOf.call(account_one);
            let acc_one_after = balance.toNumber();

            balance = await instance.balanceOf.call(account_two);
            let acc_two_after = balance.toNumber();

            assert.equal(acc_one_after, acc_one_before - transferAmt, "Token transfer works wrong!");
            assert.equal(acc_two_after, acc_two_before + transferAmt, "Token transfer works wrong!");
        });

    });
});
