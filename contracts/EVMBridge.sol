pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GenericERC20Token.sol";
import "./WrappedERC20Token.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

    error InvalidAmount();
    error InvalidTokenSymbol();
    error InvalidTokenName();

contract EVMBridge is AccessControl, Ownable, ReentrancyGuard{
    mapping(string => address) public tokens;
    mapping(address => TransferRequest[]) public userTransferRequests;

    struct TransferRequest {
        bytes32 transferRequestId;
        address user;
        string tokenSymbol;
        uint256 amount;
        uint timestamp;
    }

    event TransferInitiated(
        bytes32 transferRequestId,
        address indexed user,
        string tokenSymbol,
        address indexed tokenAddress,
        uint256 amount,
        string sourceChainId,
        string targetChainId,
        uint timestamp
    );

    event TokenAmountLocked(
        address indexed user,
        string tokenSymbol,
        address indexed tokenAddress,
        uint256 amount,
        address lockedInContract,
        uint timestamp
    );

    event TokenAmountBurned(
        address indexed user,
        string tokenSymbol,
        address indexed tokenAddress,
        uint256 amount,
        string chainId,
        uint timestamp
    );

    event TokenAmountMinted(
        address indexed user,
        string tokenSymbol,
        address indexed tokenAddress,
        uint256 amount,
        string chainId,
        uint timestamp
    );

    event TokenAmountReleased(
        address toUser,
        string tokenSymbol,
        address tokenAddress,
        uint256 amount,
        string chainId,
        uint timestamp
    );

    event NewTokenCreated(
        string tokenSymbol,
        address tokenAddress,
        uint timestamp
    );

    modifier isValidAmount(uint256 _amount) {
        if (_amount <= 0) {
            revert InvalidAmount();
        }
        _;
    }

    modifier isValidSymbol (string memory _tokenSymbol) {
        bytes memory tempSymbol = bytes(_tokenSymbol);
        if (tempSymbol.length == 0) {
            revert InvalidTokenSymbol();
        }
        _;
    }

    modifier isValidName (string memory _tokenName) {
        bytes memory tempSymbol = bytes(_tokenName);
        if (tempSymbol.length == 0) {
            revert InvalidTokenSymbol();
        }
        _;
    }

    function lock(uint256 amount, string memory _tokenSymbol) external onlyOwner isValidAmount(amount) isValidSymbol(_tokenSymbol){
        // take a look at the signed messages

        // sign, transfer the amount, lock for a period of time.

    }

    function createToken (string memory _tokenName, string memory _tokenSymbol) external isValidName(_tokenName) isValidSymbol(_tokenSymbol){
        // TODO: Handle, if token already deployed
        address newTokenAddress = address(new GenericERC20Token(_tokenName, _tokenSymbol));

        emit NewTokenCreated(_tokenSymbol, newTokenAddress, block.timestamp);
    }

    function mint(
        string memory _tokenSymbol,
        string memory _tokenName,
        address _toUser,
        address _tokenAddress,
        uint256 _amount) external {

        address token = getERC20Token(_tokenSymbol);
        if (token == address(0)) {
            // werc20 = factory.createWERC20(_tokenName, tokenSymbol);
            // wrappedToNative[werc20] = _tokenAddress;
        }
    }

    function burn(string memory _tokenSymbol) external onlyOwner isValidSymbol(_tokenSymbol) {


    }

    function release() external onlyOwner {

    }

    function balanceOf(address user) external view {

    }

    function getUserTransferRequests(address _user) external view returns(TransferRequest[] memory) {
        return userTransferRequests[_user];
    }

    function getERC20Token(string memory _tokenSymbol) private view returns(address) {
        return tokens[_tokenSymbol];
    }
}