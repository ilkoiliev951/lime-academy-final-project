pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GenericERC20.sol";
import "./WrappedERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error InvalidAmount();
error InvalidTokenSymbol();
error InvalidTokenName();
error InvalidChainId();
error TokenDoesntExist();

contract EVMBridge is AccessControl, Ownable, ReentrancyGuard {

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

    modifier isValidString (string memory _input) {
        bytes memory tempSymbol = bytes(_input);
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
        bytes32 hashedMessage,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external payable isValidAmount(_amount)  {
        // transfer from user wallet to contract must happen
        require(msg.value > 0, "We need to wrap at least 1 wei");
        require(recoverSigner(hashedMessage, _v, _r, _s) == _user, 'Receiver did not signed the message');

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

    function release(uint256 _amount, address _tokenAddress, string memory _tokenSymbol, string memory _chainId) external isValidAmount(_amount) isValidString(_tokenSymbol) {
        address user = msg.sender;
        IERC20(_tokenAddress).transferFrom(address(this), user, _amount);
        emit TokenAmountReleased(user, _tokenSymbol, _tokenAddress, _amount, _chainId, block.timestamp);
    }

    function mint(
        string memory _tokenSymbol,
        string memory _tokenName,
        address _tokenAddress,
        address _toUser,
        uint256 _amount,
        string memory _chainId) external
    isValidString(_tokenName)
    isValidString(_tokenSymbol)
    isValidAmount(_amount) {
        if (_tokenAddress == address(0)) {
            revert TokenDoesntExist();
        }

        WrappedERC20(_tokenAddress).mint(_toUser, _amount);

        emit TokenAmountMinted(
            _toUser,
            _tokenSymbol,
            _tokenName,
            _amount,
            _chainId,
            block.timestamp
        );
    }

    function createToken(string memory _tokenName, string memory _tokenSymbol, string memory chainId) public onlyOwner() isValidString(_tokenName) isValidString(_tokenSymbol) returns (address) {
        address newTokenAddress;
        if (compareStrings(chainId, "SEPOLIA")) {
            newTokenAddress = address(new GenericERC20(_tokenName, _tokenSymbol));
        } else if (compareStrings(chainId, "GOERLI")){
            newTokenAddress = address(new WrappedERC20(_tokenName, _tokenSymbol));
        } else {
            revert InvalidChainId();
        }

        emit NewTokenCreated(_tokenSymbol, _tokenName, newTokenAddress, block.timestamp);
        return newTokenAddress;
    }

    function burnWithPermit(
        string memory _tokenSymbol,
        address _tokenAddress,
        string memory _chainId,
        address _from,
        uint256 _amount,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
    external
    isValidString(_tokenSymbol)
    isValidString(_chainId)
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
        emit TokenAmountBurned(_tokenSymbol, _amount, _chainId, block.timestamp);
        return true;
    }

    function getWERCBalanceOf(address _tokenAddress, address _userAccount) external view returns (uint256){
        return WrappedERC20(_tokenAddress).balanceOf(_userAccount);
    }

    function getERCBalanceOf(address _tokenAddress,  address _userAccount) external view  returns (uint256){
        return GenericERC20(_tokenAddress).balanceOf(_userAccount);
    }

    function compareStrings(string memory val1, string memory val2) public pure returns (bool) {
        return keccak256(abi.encodePacked(val1)) == keccak256(abi.encodePacked(val2));
    }

    function recoverSigner(bytes32 hashedMessage, uint8 v, bytes32 r, bytes32 s) pure internal returns (address) {
        bytes32 messageDigest = keccak256(abi.encodePacked("\\x19Ethereum Signed Message:\\n32", hashedMessage));
        return ecrecover(messageDigest, v, r, s);
    }
}