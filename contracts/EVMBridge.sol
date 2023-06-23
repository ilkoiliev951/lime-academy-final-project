pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GenericERC20.sol";
import "./WrappedERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error InvalidAmount();
error InvalidTokenType();
error InvalidStringInput();
error TokenDoesntExist();

contract EVMBridge is Ownable, ReentrancyGuard {
    mapping(string => address) public tokens;

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
        string tokenSymbol,
        uint256 amount,
        uint256 chainId,
        uint timestamp
    );

    event TokenAmountMinted(
        address indexed user,
        string tokenSymbol,
        string tokenName,
        uint256 amount,
        uint256 chainId,
        uint timestamp
    );

    event TokenAmountReleased(
        address toUser,
        string tokenSymbol,
        address tokenAddress,
        uint256 amount,
        uint256 chainId,
        uint timestamp
    );

    event NewTokenCreated(
        string tokenSymbol,
        string tokenName,
        address tokenAddress,
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
    ) external payable isValidAmount(_amount) isValidString(_tokenSymbol) {

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

    function release(uint256 _amount, address _tokenAddress, string memory _tokenSymbol) external isValidAmount(_amount) isValidString(_tokenSymbol) {
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
            _tokenName,
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
        emit TokenAmountBurned(_tokenSymbol, _amount, block.chainid, block.timestamp);
        return true;
    }

    function compareStrings(string memory val1, string memory val2) public pure returns (bool) {
        return keccak256(abi.encodePacked(val1)) == keccak256(abi.encodePacked(val2));
    }
}