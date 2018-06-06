pragma solidity ^0.4.21;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./GACR.sol";

contract Crowdsale is Ownable {
    using SafeMath for uint256;

    // ICO stage
    enum CrowdsaleStage { PreICO, ICO }
    CrowdsaleStage public stage = CrowdsaleStage.PreICO; // By default it's Pre Sale

    // Token distribution
    uint256 public constant maxTokens           = 50000000*1e18;    // max of GACR tokens
    uint256 public constant tokensForSale       = 28500000*1e18;    // 57%
    uint256 public constant tokensForBounty     = 1500000*1e18;     // 3%
    uint256 public constant tokensForAdvisors   = 3000000*1e18;     // 6%
    uint256 public constant tokensForTeam       = 9000000*1e18;     // 18%
    uint256 public tokensForEcosystem           = 8000000*1e18;     // 16%

    // Start & End time of Crowdsale
    uint256 startTime   = 1522494000;   // 2018-03-31T11:00:00
    uint256 endTime     = 1539169200;   // 2018-10-10T11:00:00

    // The token being sold
    GACR public token = new GACR(maxTokens);

    // Address where funds are collected
    address public wallet;

    // How many token units a buyer gets per wei
    uint256 public rate;

    // Amount of wei raised
    uint256 public weiRaised;

    // Limit for total contributions
    uint256 public cap;

    // KYC for ICO
    mapping(address => bool) public whitelist;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    /**
     * Event for whitelist update
     * @param purchaser who add to whitelist
     * @param status of purchased for whitelist
     */
    event WhitelistUpdate(address indexed purchaser, bool status);

    /**
     * Event for crowdsale finalize
     */
    event Finalized();

    /**
     * @param _cap ether cap for Crowdsale
     * @param _rate Number of token units a buyer gets per wei
     * @param _wallet Address where collected funds will be forwarded to
     */
    constructor(uint256 _cap, uint256 _rate, address _wallet) public {
        require(_cap > 0);
        require(_rate > 0);
        require(_wallet != address(0));

        cap = _cap;
        rate = _rate;
        wallet = _wallet;
    }

    /**
     * Check that sale is on
     */
    modifier saleIsOn() {
        require(now > startTime && now < endTime);
        _;
    }

    //note: only for test
    //function setNowTime(uint value) public onlyOwner {
    //    require(value != 0);
    //    _nowTime = value;
    //}

    /**
     * Buy tokens
     */
    function buyTokens(address _beneficiary) saleIsOn public payable {
        uint256 _weiAmount = msg.value;

        require(_beneficiary != address(0));
        require(_weiAmount != 0);
        require(weiRaised.add(_weiAmount) <= cap);

        require(stage==CrowdsaleStage.PreICO ||
               (stage==CrowdsaleStage.ICO && isWhitelisted(_beneficiary)));

        // calculate token amount to be created
        uint256 _tokenAmount = _weiAmount.mul(rate);

        // bonus calculation
        uint256 bonusTokens = 0;
        if (stage == CrowdsaleStage.PreICO) {
            if (_tokenAmount >= 50e18 && _tokenAmount < 3000e18) {
                bonusTokens = _tokenAmount.mul(23).div(100);
            } else if (_tokenAmount >= 3000e18 && _tokenAmount < 15000e18) {
                bonusTokens = _tokenAmount.mul(27).div(100);
            } else if (_tokenAmount >= 15000e18 && _tokenAmount < 30000e18) {
                bonusTokens = _tokenAmount.mul(30).div(100);
            } else if (_tokenAmount >= 30000e18) {
                bonusTokens = _tokenAmount.mul(35).div(100);
            }
        } else if (stage == CrowdsaleStage.ICO) {
            uint256 _nowTime = now;

            if (_nowTime >= 1531486800 && _nowTime < 1532696400) {
                bonusTokens = _tokenAmount.mul(18).div(100);
            } else if (_nowTime >= 1532696400 && _nowTime < 1533906000) {
                bonusTokens = _tokenAmount.mul(15).div(100);
            } else if (_nowTime >= 1533906000 && _nowTime < 1535115600) {
                bonusTokens = _tokenAmount.mul(12).div(100);
            } else if (_nowTime >= 1535115600 && _nowTime < 1536325200) {
                bonusTokens = _tokenAmount.mul(9).div(100);
            } else if (_nowTime >= 1536325200 && _nowTime < 1537534800) {
                bonusTokens = _tokenAmount.mul(6).div(100);
            } else if (_nowTime >= 1537534800 && _nowTime < endTime) {
                bonusTokens = _tokenAmount.mul(3).div(100);
            }
        }
        _tokenAmount += bonusTokens;

        // check limit for sale
        require(tokensForSale >= (token.totalSupply() + _tokenAmount));

        // update state
        weiRaised = weiRaised.add(_weiAmount);
        token.mint(_beneficiary, _tokenAmount);

        emit TokenPurchase(msg.sender, _beneficiary, _weiAmount, _tokenAmount);

        wallet.transfer(_weiAmount);
    }

    function () external payable {
        buyTokens(msg.sender);
    }

    /**
     * Change Crowdsale Stage.
     * Options: PreICO, ICO
     */
    function setCrowdsaleStage(uint value) public onlyOwner {

        CrowdsaleStage _stage;

        if (uint256(CrowdsaleStage.PreICO) == value) {
            _stage = CrowdsaleStage.PreICO;
        } else if (uint256(CrowdsaleStage.ICO) == value) {
            _stage = CrowdsaleStage.ICO;
        }

        stage = _stage;
    }

    /**
     * Set new rate
     */
    function setNewRate(uint _newRate) public onlyOwner {
        require(_newRate != 0);
        rate = _newRate;
    }

    /**
     * add/remove to whitelist array of addresses based on boolean status
     */
    function updateWhitelist(address[] addresses, bool status) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            address contributorAddress = addresses[i];
            whitelist[contributorAddress] = status;
            emit WhitelistUpdate(contributorAddress, status);
        }
    }

    /**
     * Check that address is exist in whitelist
     */
    function isWhitelisted(address contributor) public constant returns (bool) {
        return whitelist[contributor];
    }

    /**
     * Finish Crowdsale & Mint
     */
    function finish(address _bountyFund, address _advisorsFund, address _ecosystemFund, address _teamFund) public onlyOwner {

        emit Finalized();

        uint256 unsoldTokens = tokensForSale - token.totalSupply();
        if (unsoldTokens > 0) {
            tokensForEcosystem = tokensForEcosystem + unsoldTokens;
        }

        token.mint(_bountyFund,tokensForBounty);
        token.mint(_advisorsFund,tokensForAdvisors);
        token.mint(_ecosystemFund,tokensForEcosystem);
        token.mint(_teamFund,tokensForTeam);
        token.finishMinting();
    }
}
