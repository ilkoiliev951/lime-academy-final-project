pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EVMBridge is AccessControl, Ownable {
    mapping(string => address) public tokens;
    mapping (bytes32 => TransferRequest) transfers;
    mapping(address => bytes32) public userTransferRequest;

    struct TransferRequest {
        bytes32 transferRequestId;
        address user;
        string tokenSymbol;
        uint256 amount;
        uint timestamp;
    }

    event TransferInitiated();
    event TokenAmountLocked();
    event TokenAmountBurned();
    event TokenAmountMinted();
    event TokenAmountTransferredToUser();
    event NewTokenCreated();


    modifier isValidAddress () {

        _;
    }
    modifier isValidAmount() {
        _;
    }

    modifier isValidSymbol () {
        _;
    }

    function lock() external onlyOwner{

    }

    function initiateTransfer() external {
    }

    function createToken () external {

    }

    function mint() external onlyOwner{

    }

    function burn() external onlyOwner{

    }

    function release() external onlyOwner {

    }

    function transferTokenAmountToUserAccount() external onlyOwner {

    }

    function balanceOf() external {

    }
}