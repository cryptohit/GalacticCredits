pragma solidity ^0.4.21;

import "zeppelin-solidity/contracts/token/ERC20/CappedToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";

/**
 * @title GACR token
 */
contract GACR is CappedToken, BurnableToken {

    string public name      = "Galactic Credits";
    string public symbol    = "GACR";
    uint8 public decimals   = 18;

    address public teamFund; // team wallet address
    bool public isSetTeamWallet = false;

    /**
     * @param _cap token cap for GACR
     */
    constructor(uint256 _cap) public CappedToken(_cap) {}

    /**
     * @dev Set team address (only once)
     */
    function setTeamAddress(address _teamFund) public onlyOwner {
        require(isSetTeamWallet == false);

        teamFund = _teamFund;
        isSetTeamWallet = true;
    }

    /**
     * @dev Tokens for team will be frozen for a period of 6 months after end ICO
     * Note: timestamp 1539169200 is equal 2018-10-10T11:00:00
     */
    modifier canTransfer (address sender) {
        if (sender == teamFund) {
            require(now > (1539169200 + 180 days));
        }
        _;
    }

    /**
     * @dev Overridden for check canTransfer
     */
    function transfer(address _to, uint256 _value) public canTransfer(msg.sender) returns (bool) {
        return super.transfer(_to, _value);
    }

    /**
     * @dev Overridden for check canTransfer
     */
    function transferFrom(address _from, address _to, uint256 _value) public canTransfer(_from) returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Fallback function
     */
    function() public payable {
        revert();
    }
}
