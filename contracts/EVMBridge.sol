pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GenericERC20.sol";
import "./WrappedERC20.sol";
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

    function lock(
        address _user,
        address _tokenAddress,
        string memory _tokenSymbol,
        uint256 _chainId,
        uint256 _amount,
        uint256 _deadline,
        address receiver,
        bytes32 hashedMessage,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external payable isValidAmount(_amount) isValidSymbol(_tokenSymbol) {
        // transfer from user wallet to contract must happen
   ///     require(msg.value > 0, "We need to wrap at least 1 wei");
        require(recoverSigner(hashedMessage, _v, _r, _s) == receiver, 'Receiver does not signed the message');

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

        emit TokenAmountLocked(msg.sender, _tokenSymbol, _tokenAddress, _amount, address(this), block.timestamp);
    }

    function release(uint256 _amount, address _tokenAddress, string memory _tokenSymbol, string memory _chainId) external isValidAmount(_amount) isValidSymbol(_tokenSymbol) {
        address user = msg.sender;
        IERC20(_tokenAddress).transferFrom(address(this), user, _amount);
        emit TokenAmountReleased(user, _tokenSymbol, _tokenAddress, _amount, _chainId, block.timestamp);
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

        WrappedERC20(tokenAddress).mint(_toUser, _amount);

        emit TokenAmountMinted(
            _toUser,
            _tokenSymbol,
            _tokenName,
            _amount,
            _chainId,
            block.timestamp
        );
    }

    function createToken(string memory _tokenName, string memory _tokenSymbol, string memory chainId) public isValidName(_tokenName) isValidSymbol(_tokenSymbol) returns (address) {
        if (tokens[_tokenSymbol] != address(0)) {
            revert TokenAlreadyCreated();
        }

        if (!(compareStrings(chainId, SEPOLIA_CHAIN_ID)) && !(compareStrings(chainId, GOERLI_CHAIN_ID))) {
            revert InvalidChainId();
        }

        address newTokenAddress = address(0);
        if (compareStrings(chainId, SEPOLIA_CHAIN_ID)) {
            newTokenAddress = address(new GenericERC20(_tokenName, _tokenSymbol));
        } else {
            newTokenAddress = address(new WrappedERC20(_tokenName, _tokenSymbol));
        }
        tokens[_tokenSymbol] = newTokenAddress;

        emit NewTokenCreated(_tokenSymbol, _tokenName, newTokenAddress, block.timestamp);
        return newTokenAddress;
    }

    function burn(string memory _tokenSymbol, uint256 _amount, string memory _chainId) external onlyOwner isValidSymbol(_tokenSymbol) {
        address tokenAddress = tokens[_tokenSymbol];
        WrappedERC20(tokenAddress).burnFrom(address(this), _amount);
        emit TokenAmountBurned(_tokenSymbol, _amount, _chainId, block.timestamp);
    }

    function getERC20Token(string memory _tokenSymbol) private view returns (address) {
        return tokens[_tokenSymbol];
    }

    function compareStrings(string memory val1, string memory val2) public pure returns (bool) {
        return keccak256(abi.encodePacked(val1)) == keccak256(abi.encodePacked(val2));
    }

    function recoverSigner(bytes32 hashedMessage, uint8 v, bytes32 r, bytes32 s) pure internal returns (address) {
        bytes32 messageDigest = keccak256(abi.encodePacked("\\x19Ethereum Signed Message:\\n32", hashedMessage));
        return ecrecover(messageDigest, v, r, s);
    }
}