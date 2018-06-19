const GACR = artifacts.require("./GACR.sol");
const Crowdsale = artifacts.require("./Crowdsale.sol");

contract('Crowdsale', function(accounts) {

    describe('general', () => {

        it('cap should be 71250 ETH', function(done) {
            Crowdsale.deployed().then(async function(instance) {
                const cap = await instance.cap.call();
                assert.equal(cap.toNumber(), web3.toWei(71250, 'ether'), "cap is incorrect");
                done();
            });
        });

        /* note (debug): only separately test
        it('maximum 28,500,000 GACR limit', function(done) {
            Crowdsale.deployed().then(async function(instance) {
                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                await gacrToken.mint(accounts[1], 28500000e18);

                //let accountBalance = await gacrToken.balanceOf(accounts[1]);
                //console.log('accountBalance : ' + accountBalance);

                try {
                    await instance.sendTransaction({ from: accounts[1], value: web3.toWei(1, "ether")});
                    assert.fail('should have revert transaction');
                } catch (error) {
                    assert.isAbove(error.message.search('revert'), -1, error.message);
                }
                done();
            });
        });*/

    });

    describe('change values', () => {

        it('should deploy the token and store the address', function(done){
            Crowdsale.deployed().then(async function(instance) {
                const token = await instance.token.call();
                assert(token, 'Token address couldn\'t be stored');
                done();
            });
        });

        it('crowdsale contract should be the owner of GACR token', function(done){
            Crowdsale.deployed().then(async function(instance) {
                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                await gacrToken.transferOwnership(instance.address, { from: accounts[0] });
                assert.equal(await gacrToken.owner(), instance.address, 'Crowdsale is not the owner of the token');
                done();
            });
        });

        it('should set stage to ICO', function(done){
            Crowdsale.deployed().then(async function(instance) {
                await instance.setCrowdsaleStage(1);
                const stage = await instance.stage.call();
                assert.equal(stage.toNumber(), 1, 'The stage couldn\'t be set to ICO');
                done();
            });
        });

        it('should set stage to PreICO', function(done){
            Crowdsale.deployed().then(async function(instance) {
                await instance.setCrowdsaleStage(0);
                const stage = await instance.stage.call();
                assert.equal(stage.toNumber(), 0, 'The stage couldn\'t be set to PreICO');
                done();
            });
        });

        it('should set rate to 200', function(done){
            Crowdsale.deployed().then(async function(instance) {
                await instance.setNewRate(200);
                const rate = await instance.rate.call();
                assert.equal(rate.toNumber(), 200, 'The rate couldn\'t be set to 200');
                done();
            });
        });

        it('should set rate to 400', function(done){
            Crowdsale.deployed().then(async function(instance) {
                await instance.setNewRate(400);
                const rate = await instance.rate.call();
                assert.equal(rate.toNumber(), 400, 'The rate couldn\'t be set to 400');
                done();
            });
        });

    });

    describe('buyTokens()', () => {

        it('should deploy the token and store the address', function(done) {
            Crowdsale.deployed().then(async function(instance) {
                const token = await instance.token.call();
                assert(token, 'Token address couldn\'t be stored');
                done();
            });
        });

        describe('PreICO : buy tokens & bonuses', () => {

            let instance = null;
            const account_one = accounts[2];
            const account_two = accounts[3];

            before(async () => {
                instance = await Crowdsale.deployed();

                // set rate=400 (1GACR=0.0025ETH) & stage=0 (PreICO)
                await instance.setCrowdsaleStage(0);
                await instance.setNewRate(400);
                //await instance.setNowTime(1522494001); // set time in during saleIsOn
            });

            it('should transfer the ETH to wallet immediately', async () => {
                let balanceOfBeneficiary = await web3.eth.getBalance(accounts[9]);
                balanceOfBeneficiary = Number(balanceOfBeneficiary.toString(10));

                await instance.sendTransaction({ from: accounts[1], value: web3.toWei(1, "ether")});

                let newBalanceOfBeneficiary = await web3.eth.getBalance(accounts[9]);
                newBalanceOfBeneficiary = Number(newBalanceOfBeneficiary.toString(10));

                assert.equal(newBalanceOfBeneficiary, balanceOfBeneficiary + 1e18, 'ETH couldn\'t be transferred to the beneficiary');
            });

            it('should buy 40 GACR Tokens + 0% bonus', async () => {
                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(0.1, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);

                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 40e18, 'The sender didn\'t receive the tokens as per PreICO rate');
            });

            it('should buy 400 GACR Tokens + 23% bonus', async () => {
                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(1, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);
                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 492e18, 'The sender didn\'t receive the tokens as per PreICO rate');
            });

            it('should buy 10,000 GACR Tokens + 27% bonus', async () => {
                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(25, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);
                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 12700e18, 'The sender didn\'t receive the tokens as per PreICO rate');
            });

            it('should buy 20,000 GACR Tokens + 30% bonus', async () => {
                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(50, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);
                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 26000e18, 'The sender didn\'t receive the tokens as per PreICO rate');
            });

            it('should buy 30,000 GACR Tokens + 35% bonus', async () => {
                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_two);
                const data = await instance.sendTransaction({ from: account_two, value: web3.toWei(75, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_two);
                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 40500e18, 'The sender didn\'t receive the tokens as per PreICO rate');
            });
        });

        /* note : need activate setNowTime for testing
        describe('ICO : buy tokens & bonuses', () => {

            let instance = null;
            const account_one = accounts[4];

            before(async () => {
                instance = await Crowdsale.deployed();

                // set rate=400 (1GACR=0.0025ETH) & stage=1 (ICO)
                await instance.setCrowdsaleStage(1);
                await instance.setNewRate(400);
                await instance.updateWhitelist([account_one], true);
            });

            it('should buy 1,000 GACR Tokens + 18% bonus in ICO', async () => {
                await instance.setNowTime(1531486800);  // 13 Jul 2018 13:00:00

                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(2.5, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);

                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 1180e18, 'The sender didn\'t receive the tokens as per ICO rate');
            });

            it('should buy 1,000 GACR Tokens + 15% bonus in ICO', async () => {
                await instance.setNowTime(1532696400);  // 27 Jul 2018 13:00:00

                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(2.5, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);

                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 1150e18, 'The sender didn\'t receive the tokens as per ICO rate');
            });

            it('should buy 1,000 GACR Tokens + 12% bonus in ICO', async () => {
                await instance.setNowTime(1533906000);  // 10 Aug 2018 13:00:00

                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(2.5, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);

                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 1120e18, 'The sender didn\'t receive the tokens as per ICO rate');
            });

            it('should buy 1,000 GACR Tokens + 9% bonus in ICO', async () => {
                await instance.setNowTime(1535115600);  // 24 Aug 2018 13:00:00

                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(2.5, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);

                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 1090e18, 'The sender didn\'t receive the tokens as per ICO rate');
            });

            it('should buy 1,000 GACR Tokens + 6% bonus in ICO', async () => {
                await instance.setNowTime(1536325200);  // 07 Sep 2018 13:00:00

                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(2.5, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);

                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 1060e18, 'The sender didn\'t receive the tokens as per ICO rate');
            });

            it('should buy 1,000 GACR Tokens + 3% bonus in ICO', async () => {
                await instance.setNowTime(1537534800);  // 21 Sep 2018 13:00:00

                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const tokenAmountBefore = await gacrToken.balanceOf(account_one);
                const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(2.5, "ether")});
                const tokenAmountAfter = await gacrToken.balanceOf(account_one);

                assert.equal(tokenAmountAfter.toNumber(), tokenAmountBefore.toNumber() + 1030e18, 'The sender didn\'t receive the tokens as per ICO rate');
            });

            it('revert when time of ICO is expired', async () => {
                await instance.setNowTime(1539169200);  // 10 Oct 2018 11:00:00

                try {
                    const data = await instance.sendTransaction({ from: account_one, value: web3.toWei(2.5, "ether")});
                    assert.fail('should have thrown before');
                } catch (error) {
                    assert.isAbove(error.message.search('revert'), -1, error.message);
                }
            });

        }); */

    });

    describe('whitelist in ICO', () => {

        let instance = null;
        const account_1 = accounts[1];
        const account_2 = accounts[2];
        const account_3 = accounts[3];

        before(async () => {
            instance = await Crowdsale.deployed();

            // set rate=400 (1GACR=0.0025ETH) & stage=1 (ICO)
            await instance.setCrowdsaleStage(1);
            await instance.setNewRate(400);
        });

        it('should add two contributors to whitelist', async () => {
            await instance.updateWhitelist([account_1, account_2], true);

            assert.isTrue(await instance.isWhitelisted(account_1));
            assert.isTrue(await instance.isWhitelisted(account_2));
        });

        it('should add the same contributor to whitelist', async () => {
            await instance.updateWhitelist([account_3], true);
            assert.isTrue(await instance.isWhitelisted(account_3));
        });

        it('should remove the same contributor to whitelist', async () => {
            await instance.updateWhitelist([account_3], false);
            assert.isFalse(await instance.isWhitelisted(account_3));
        });

        it('only owner can add and remove from whitelist', async () => {
            try {
                await instance.updateWhitelist([account_3], true, { from: account_3 });
                assert.fail('should have thrown before');
            } catch (error) {
                assert.isAbove(error.message.search('revert'), -1, error.message);
            }
        });

        it('whitelist\'s address can do transaction', async () => {
            try {
                //await instance.setNowTime(1537534800);  // 21 Sep 2018 13:00:00
                await instance.updateWhitelist([account_1], true);
                await instance.sendTransaction({ from: account_1, value: web3.toWei(2.5, "ether") });
                assert.isTrue(true);
            } catch (error) {
                assert.fail('should have success transaction', error.message);
            }
        });

        it('revert transaction for whitelist\'s address', async () => {
            try {
                //await instance.setNowTime(1537534800);  // 21 Sep 2018 13:00:00
                await instance.updateWhitelist([account_3], false);
                await instance.sendTransaction({ from: account_3, value: web3.toWei(2.5, "ether") });
                assert.fail('should have revert transaction');
            } catch (error) {
                assert.isAbove(error.message.search('revert'), -1, error.message);
            }
        });
    });

    describe('mint', () => {

        it('should mint()', function(done) {
            Crowdsale.deployed().then(async function(instance) {
                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);
                const balanceBefore = await gacrToken.balanceOf(accounts[0]);

                const mintAmount = new web3.BigNumber('100');
                await instance.mint(accounts[0], mintAmount, { from: accounts[0] });
                const balanceAfter = await gacrToken.balanceOf(accounts[0]);

                assert(balanceAfter.eq(balanceBefore+mintAmount));

                done();
            });
        });

    });

    describe('finalize', () => {

        it('the owner could finalize the crowdsale', function(done) {
            Crowdsale.deployed().then(async function(instance) {

                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);

                //console.log('GACR token supply before   : ' + await gacrToken.totalSupply());

                await instance.finish(accounts[0], accounts[1], accounts[2], accounts[3]);

                //console.log('GACR token supply after    : ' + await gacrToken.totalSupply());
                //console.log('BountyFund token supply    : ' + await gacrToken.balanceOf(accounts[0]));
                //console.log('AdvisorsFund token supply  : ' + await gacrToken.balanceOf(accounts[1]));
                //console.log('EcoSystemFund token supply : ' + await gacrToken.balanceOf(accounts[2]));
                //console.log('TeamFund token supply      : ' + await gacrToken.balanceOf(accounts[3]));

                assert.isTrue(await gacrToken.mintingFinished.call(), 'Mint is not finished');
                done();
            });
        });

        it('should return rights to account', function(done) {
            Crowdsale.deployed().then(async function(instance) {

                const tokenAddress = await instance.token.call();
                const gacrToken = GACR.at(tokenAddress);

                await instance.returnOwnership({ from: accounts[0] });
                assert.equal(await gacrToken.owner(), accounts[0]);

                done();
            });
        });

    });

});
