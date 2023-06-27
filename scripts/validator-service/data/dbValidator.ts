


export async function validateNewToken(tokenSymbol, tokenAddress, amount, userAddress) {

    // validate that token with same name/symbol is not created on the bridge
}

export async function validateLock(tokenSymbol, tokenAddress, amount, userAddress) {
    // validate that no other unclaimed locks exist

}


export async function validateMint(tokenSymbol, tokenAddress, amount, userAddress) {
    // validate that a lock has occured and it is not claimed
    // validate the amount to be less or equal the balance that has been locked

}

export async function validateBurn(tokenSymbol, tokenAddress, amount, userAddress) {

}

export async function validateRelease(tokenSymbol, tokenAddress, amount, userAddress) {

}




