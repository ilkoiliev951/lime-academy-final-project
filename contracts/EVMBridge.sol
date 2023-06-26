// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GenericERC20.sol";
import "./WrappedERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error InvalidAmount();
error InvalidTokenType();
error InvalidStringInput();
error TokenDoesntExist();

contract EVMBridge is Ownable, ReentrancyGuard {
    mapping(string => address) public tokens;
    mapping(bytes32 => UserBalance) private balanceKeyMap;

    constructor() ReentrancyGuard() {}

    struct UserBalance {
        string tokenSymbol;
        address tokenAddress;
        uint256 tokenBalance;
        address userAddress;
    }

    event TokenAmountLocked(
        address indexed user,
        string tokenSymbol,
        address indexed tokenAddress,
        uint256 amount,
        address lockedInContract,
        uint256 chainId,
        uint timestamp
    );

    event TokenAmountBurned(
        address indexed user,
        string tokenSymbol,
        address indexed tokenAddress,
        uint256 amount,
        uint256 chainId,
        uint timestamp
    );

    event TokenAmountMinted(
        address indexed user,
        string tokenSymbol,
        address indexed tokenAddress,
        uint256 amount,
        uint256 chainId,
        uint timestamp
    );

    event TokenAmountReleased(
        address indexed toUser,
        string tokenSymbol,
        address indexed tokenAddress,
        uint256 amount,
        uint256 chainId,
        uint timestamp
    );

    event NewTokenCreated(
        string tokenSymbol,
        string tokenName,
        address indexed tokenAddress,
        uint256 chainId,
        uint timestamp
    );

    event UserBridgeBalanceUpdated(
        string tokenSymbol,
        address indexed tokenAddress,
        address user,
        uint256 chainId,
        uint timestamp
    );

    modifier isValidAmount(uint256 _amount) {
        if (_amount <= 0) {
            revert InvalidAmount();
        }
        _;
    }

    modifier isValidString (string memory _input) {
        bytes memory tempSymbol = bytes(_input);
        if (tempSymbol.length == 0) {
            revert InvalidStringInput();
        }
        _;
    }

    function lock(
        address _user,
        address _tokenAddress,
        string memory _tokenSymbol,
        uint256 _amount,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external payable nonReentrant() isValidAmount(_amount) isValidString(_tokenSymbol) {

        IERC20Permit(_tokenAddress).permit(
            _user,
            address(this),
            _amount,
            _deadline,
            _v,
            _r,
            _s
        );
        IERC20(_tokenAddress).transferFrom(_user, address(this), _amount);

        emit TokenAmountLocked(msg.sender, _tokenSymbol, _tokenAddress, _amount, address(this), block.chainid, block.timestamp);
    }

    function release(uint256 _amount, address _tokenAddress, string memory _tokenSymbol) external nonReentrant() isValidAmount(_amount) isValidString(_tokenSymbol) {
        address user = msg.sender;
        IERC20(_tokenAddress).transfer(user, _amount);
        emit TokenAmountReleased(user, _tokenSymbol, _tokenAddress, _amount, block.chainid, block.timestamp);
    }

    function mint(
        string memory _tokenSymbol,
        string memory _tokenName,
        address _tokenAddress,
        address _toUser,
        uint256 _amount) external
    nonReentrant()
    isValidString(_tokenName)
    isValidString(_tokenSymbol)
    isValidAmount(_amount) {
        if (tokens[_tokenSymbol] == address(0)) {
            revert TokenDoesntExist();
        }

        WrappedERC20(_tokenAddress).mint(_toUser, _amount);

        emit TokenAmountMinted(
            _toUser,
            _tokenSymbol,
            _tokenAddress,
            _amount,
            block.chainid,
            block.timestamp
        );
    }

    function createToken(string memory _tokenName, string memory _tokenSymbol, string memory _tokenType) public onlyOwner() isValidString(_tokenName) isValidString(_tokenSymbol) returns (address) {
        require(tokens[_tokenSymbol] == address(0), "Token with the same symbol has already been created on the bridge!");

        address newTokenAddress;
        if (compareStrings(_tokenType, "generic")) {
            newTokenAddress = address(new GenericERC20(_tokenName, _tokenSymbol));
        } else if (compareStrings(_tokenType, "wrapped")) {
            newTokenAddress = address(new WrappedERC20(_tokenName, _tokenSymbol));
        } else {
            revert InvalidTokenType();
        }

        tokens[_tokenSymbol] = newTokenAddress;

        emit NewTokenCreated(_tokenSymbol, _tokenName, newTokenAddress, block.chainid, block.timestamp);
        return newTokenAddress;
    }

    function burnWithPermit(
        string memory userBalanceHash,
        string memory _tokenSymbol,
        address _tokenAddress,
        address _from,
        uint256 _amount,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
    external
    nonReentrant()
    isValidString(_tokenSymbol)
    isValidAmount(_amount)
    returns (bool)
    {

        IERC20Permit(_tokenAddress).permit(
            _from,
            address(this),
            _amount,
            _deadline,
            _v,
            _r,
            _s
        );

        WrappedERC20(_tokenAddress).burnFrom(_from, _amount);
        emit TokenAmountBurned(_from, _tokenSymbol, _tokenAddress, _amount, block.chainid, block.timestamp);
        return true;
    }

    /**
    Purpose of the function is updating the user balance from the bridge owner,
    in order to check the validity of the calls, when the contract is called
    outside of the CLI context and the database cannot act as a validator.
    */
    function updateUserBridgeBalance(address _user, uint256 _newBalance, string memory _tokenSymbol) external onlyOwner()
    isValidString(_tokenSymbol)
    isValidAmount(_newBalance)
    returns (bool) {
        // check struct for null
        address tokenAddress = tokens[_tokenSymbol];
        bytes32 balanceKey = _generateHashId(_user, _tokenSymbol, block.chainid);
        if (balanceKeyMap[balanceKey].userAddress == address(0)) {
            balanceKeyMap[balanceKey] = UserBalance(_tokenSymbol, tokenAddress, _newBalance, _user);
        } else {
            balanceKeyMap[balanceKey].tokenBalance = _newBalance;
        }

        emit UserBridgeBalanceUpdated(_tokenSymbol, tokenAddress, _user, block.chainid, block.timestamp);
        return true;
    }

    function amountIsValid(uint256 newOperationAmount, string memory _tokenSymbol) private view returns (bool){
        bytes32 balanceKey = _generateHashId(msg.sender, _tokenSymbol, block.chainid);
        UserBalance memory userBalance = balanceKeyMap[balanceKey];
        if (newOperationAmount==0 || newOperationAmount > userBalance.tokenBalance) {
            revert InvalidAmount();
        }
        return true;
    }

    function compareStrings(string memory val1, string memory val2) public pure returns (bool) {
        return keccak256(abi.encodePacked(val1)) == keccak256(abi.encodePacked(val2));
    }

    function _generateHashId(address _userAddress, string memory _tokenSymbol, uint256 _chainId) private pure returns (bytes32) {
        string memory balanceKeyInput = string.concat(Strings.toHexString(uint256(uint160(_userAddress)), 20), _tokenSymbol, Strings.toString(_chainId));
        return keccak256(abi.encodePacked(balanceKeyInput));
    }
}