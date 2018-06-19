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

    describe('burn()', () => {
        const account = accounts[0];
        const burnAmount = new web3.BigNumber('2000');

        let instance = null;
        let result = null;
        let balanceBefore = null;
        let totalSupplyBefore = null;

        before(async () => {
            instance = await GACR.deployed();
            balanceBefore = await instance.balanceOf.call(account);
            totalSupplyBefore = await instance.totalSupply.call();
            result = await instance.burn(burnAmount);
        });

        it('should fire events for Burn', async () => {
            assert.equal(result.logs[0].event, 'Burn');
        });

        it('should fire events for Transfer', async () => {
            assert.equal(result.logs[1].event, 'Transfer');
        });

        it('should update total supply of tokens', async () => {
            const totalSupplyAfter = await instance.totalSupply.call();
            assert(totalSupplyAfter.eq(totalSupplyBefore-burnAmount));
        });

        it('should burn token', async () => {
            const balance = await instance.balanceOf.call(account);
            assert(balance.eq(balanceBefore-burnAmount));
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

    describe('revert()', () => {
        let instance = null;

        before(async () => {
            instance = await GACR.deployed();
        });

        it('should revert any transaction', async () => {
            try {
                await instance.sendTransaction({ from: accounts[0], value: web3.toWei(1, "ether")});
                assert.fail('should have thrown before');
            } catch (error) {
                assert.isAbove(error.message.search('revert'), -1, error.message);
            }
        });

    });

    describe('freeze()', () => {
        const team = accounts[6];
        const to = accounts[7];
        const spender = accounts[8];

        let instance = null;

        before(async () => {
            instance = await GACR.deployed();
            await instance.mint(team, new web3.BigNumber('100000'));
        });

        it("can transfer when team address is empty", async () => {
            const amount = 100;
            let balance_before = await instance.balanceOf.call(to);
            balance_before = balance_before.toNumber();

            await instance.transfer(to, amount, {from: team});
            let balance_after = await instance.balanceOf.call(to);
            balance_after = balance_after.toNumber();

            assert.equal(balance_after, balance_before + amount, "Token transfer works wrong!");
        });

        it("can transferFrom when team address is empty", async () => {
            const amount = 100;
            let balance_before = await instance.balanceOf(to);
            balance_before = balance_before.toNumber();

            await instance.approve(spender, amount, { from: team });
            await instance.transferFrom(team, to, amount, { from: spender });

            let balance_after = await instance.balanceOf(to);
            balance_after = balance_after.toNumber();

            assert.equal(balance_after, balance_before + amount, "Token transfer works wrong!");
        });

        it("cannot transfer when team address is fill", async () => {
            const amount = 100;
            await instance.setTeamAddress(team);

            try {
                await instance.transfer(to, amount, {from: team});
                assert.fail('should have thrown before');
            } catch (error) {
                assert.isAbove(error.message.search('revert'), -1, error.message);
            }
        });

        it("cannot transferFrom when team address is fill", async () => {
            const amount = 100;
            //await instance.setTeamAddress(team);
            await instance.approve(spender, amount, { from: team });

            try {
                await instance.transferFrom(team, to, amount, { from: spender });
                assert.fail('should have thrown before');
            } catch (error) {
                assert.isAbove(error.message.search('revert'), -1, error.message);
            }
        });

    });

    describe('finishMinting()', () => {

        const account = accounts[0];

        let instance = null;
        let balanceBefore = null;

        before(async () => {
            instance = await GACR.deployed();
            balanceBefore = await instance.balanceOf.call(account);
            instance.finishMinting();
        });

        it("cannot mint() after finish", async () => {
            try {
                await instance.mint(account, new web3.BigNumber('100'));
                assert.fail('should have thrown before');
            } catch (error) {
                assert.isAbove(error.message.search('revert'), -1, error.message);
            }
        });

        it('should burn() after finish', async () => {
            const burnAmount = new web3.BigNumber('100');
            await instance.burn(burnAmount);
            const balance = await instance.balanceOf.call(account);
            assert(balance.eq(balanceBefore-burnAmount));
        });

    });

});
