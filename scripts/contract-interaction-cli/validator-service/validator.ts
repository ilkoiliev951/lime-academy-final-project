const repository = require('./../data/repository')

// on mint
export async function validateLockOnSource () {

}

// on release
export async function validateBurn () {

}

// on burn
export async function validateMint() {

}

export async function validateNewToken() {
    const res = repository.fetchAllTokens();
    // filter for the token symbol
    res.then()
}