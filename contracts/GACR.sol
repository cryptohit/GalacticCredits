pragma solidity ^0.4.21;
import "zeppelin-solidity/contracts/token/ERC20/CappedToken.sol";

contract GACR is CappedToken {

    /**
     * Constant fields
     */
    string public name = "Galactic Credits";
    string public symbol = "GACR";
    uint public decimals = 18;

    uint256 private constant unit = 10 ** uint256(decimals);
    uint256 public constant cap = 50000000 * unit;

    //uint256 public constant bounties_supply = 1500000 * unit; // 3%
    //uint256 public constant advisors_supply = 3000000 * unit; // 6%
    //uint256 public constant reserve_supply = 8000000 * unit; // 16%
    //uint256 public constant team_supply = 9000000 * unit; // 18%

    function GACR() public CappedToken(cap) {}
}
