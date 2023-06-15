pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GenericERC20Token.sol";
import "./WrappedERC20Token.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

    error InvalidAmount();
    error InvalidTokenSymbol();
    error InvalidTokenName();
    error TokenAlreadyCreated();
    error InvalidChainId();
    error InsufficientBalance();

contract EVMBridge is AccessControl, Ownable, ReentrancyGuard {
    string constant private SEPOLIA_CHAIN_ID = "SEPOLIA";
    string constant private GOERLI_CHAIN_ID = "GOERLI";

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
        string tokenSymbol,
        uint256 amount,
        string chainId,
        uint timestamp
    );

    event TokenAmountMinted(
        address indexed user,
        string tokenSymbol,
        string tokenName,
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
        string tokenName,
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
            revert InvalidTokenName();
        }
        _;
    }

    function lock(uint256 amount, string memory _tokenSymbol) external isValidAmount(amount) isValidSymbol(_tokenSymbol){
        // transfer from user wallet to contract must happen
    }

    function release(uint256 amount, string memory _tokenSymbol) external isValidAmount(amount) isValidSymbol(_tokenSymbol){
        // transfer from contract back to user wallet must happen
    }

    function mint(
        string memory _tokenSymbol,
        string memory _tokenName,
        address _toUser,
        uint256 _amount,
        string memory _chainId) external
    isValidName(_tokenName)
    isValidSymbol(_tokenSymbol)
    isValidAmount(_amount) {

        address tokenAddress = getERC20Token(_tokenSymbol);
        if (tokenAddress == address(0)) {
            tokenAddress = createToken(_tokenName, _tokenSymbol, _chainId);
        }

        WrappedERC20Token(tokenAddress).mint(_toUser, _amount);

        emit TokenAmountMinted(
            _toUser,
            _tokenSymbol,
            _tokenName,
            _amount,
            _chainId,
            block.timestamp
        );
    }

    function createToken (string memory _tokenName, string memory _tokenSymbol, string memory chainId) public isValidName(_tokenName) isValidSymbol(_tokenSymbol) returns(address ) {
        if (tokens[_tokenSymbol] != address(0)) {
            revert TokenAlreadyCreated();
        }

        if (!(compareStrings(chainId, SEPOLIA_CHAIN_ID))  && !(compareStrings(chainId, GOERLI_CHAIN_ID))) {
            revert InvalidChainId();
        }

        address newTokenAddress = address(0);
        if (compareStrings(chainId, SEPOLIA_CHAIN_ID)) {
            newTokenAddress = address(new GenericERC20Token(_tokenName, _tokenSymbol));
        } else {
            newTokenAddress = address(new WrappedERC20Token(_tokenName, _tokenSymbol));
        }
        tokens[_tokenSymbol] = newTokenAddress;

        emit NewTokenCreated(_tokenSymbol, _tokenName, newTokenAddress, block.timestamp);
        return newTokenAddress;
    }

    function burn(string memory _tokenSymbol, uint256 _amount, string memory _chainId) external onlyOwner isValidSymbol(_tokenSymbol)  {
        address tokenAddress = tokens[_tokenSymbol];
        WrappedERC20Token(tokenAddress).burnFrom(address(this), _amount);
        emit TokenAmountBurned(_tokenSymbol, _amount, _chainId, block.timestamp);
    }

    function getUserTransferRequests(address _user) external view returns(TransferRequest[] memory) {
        return userTransferRequests[_user];
    }

    function getERC20Token(string memory _tokenSymbol) private view returns(address) {
        return tokens[_tokenSymbol];
    }

    function compareStrings(string memory val1, string memory val2) public pure returns (bool) {
        return keccak256(abi.encodePacked(val1)) == keccak256(abi.encodePacked(val2));
    }
}