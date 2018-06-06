const assert = require('assert');
const GACR = artifacts.require("./GACR.sol");

contract('GACR', accounts => {

    let token;
    const cap = new web3.BigNumber('50000000e18');

    beforeEach(async () => {
        token = await GACR.new(cap, { from: accounts[0] });
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

        const mint_to = accounts[0];
        const amount_to = new web3.BigNumber('100000');

        let instance = null;
        let result = null;

        before(async () => {
            instance = await GACR.deployed();
            result = await instance.mint(mint_to, amount_to);
        });

        it('should mint tokens for test', async () => {
            assert(result);
        });

        it('should fire events for Mint', async () => {
            assert.equal(result.logs[0].event, 'Mint');
        });

        it('should fire events for Transfer', async () => {
            assert.equal(result.logs[1].event, 'Transfer');
        });

        it('should update total supply of tokens', async () => {
            const totalSupply = await instance.totalSupply.call();
            assert(totalSupply.eq(new web3.BigNumber('100000')));
        });

        it('should update token balance for test', async () => {
            const balance = await instance.balanceOf.call(mint_to);
            assert(balance.eq(new web3.BigNumber('100000')));
        });

    });

    describe('send()', () => {

        const account_one = accounts[0];
        const account_two = accounts[1];
        let instance = null;

        before(async () => {
            instance = await GACR.deployed();
        });

        it("should send coin correctly", async () => {

            let transferAmt = 1000;

            let balance1 = await instance.balanceOf.call(account_one);
            let balance2 = await instance.balanceOf.call(account_two);

            let acc_one_before = balance1.toNumber();
            let acc_two_before = balance2.toNumber();

            await instance.transfer(account_two, transferAmt, {from: account_one});

            balance1 = await instance.balanceOf.call(account_one);
            balance2 = await instance.balanceOf.call(account_two);

            let acc_one_after = balance1.toNumber();
            let acc_two_after = balance2.toNumber();

            assert.equal(acc_one_after, acc_one_before - transferAmt, "Token transfer works wrong!");
            assert.equal(acc_two_after, acc_two_before + transferAmt, "Token transfer works wrong!");
        });

    });
});
