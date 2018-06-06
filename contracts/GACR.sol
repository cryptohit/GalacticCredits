pragma solidity ^0.4.21;
import "zeppelin-solidity/contracts/token/ERC20/CappedToken.sol";

contract GACR is CappedToken {

    string public name = "Galactic Credits";
    string public symbol = "GACR";
    uint8 public decimals = 18;

    constructor(uint256 _cap) public CappedToken(_cap) {}
}
