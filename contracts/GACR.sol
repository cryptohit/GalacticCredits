pragma solidity ^0.4.21;
import "zeppelin-solidity/contracts/token/ERC20/CappedToken.sol";

contract GACR is CappedToken {

    string public name      = "Galactic Credits";
    string public symbol    = "GACR";
    uint8 public decimals   = 18;

    address public teamFund; // team wallet address

    constructor(uint256 _cap) public CappedToken(_cap) {}

    /**
     * Set team address
     */
    function setTeamAddress(address _teamFund) public onlyOwner {
        teamFund = _teamFund;
    }

    /**
     * Tokens for team will be frozen for a period of 6 months after end ICO
     * Note: timestamp 1539169200 is equal 2018-10-10T11:00:00
     */
    modifier canTransfer (address sender) {
        if (sender == teamFund) {
            require(now > (1539169200 + 180 days));
        }
        _;
    }

    /**
     * Overridden
     */
    function transfer(address _to, uint256 _value) canTransfer(msg.sender) returns (bool) {
        super.transfer(_to, _value);
    }

    /**
     * Overridden
     */
    function transferFrom(address _from, address _to, uint256 _value) canTransfer(_from) returns (bool) {
        super.transferFrom(_from, _to, _value);
    }
}
