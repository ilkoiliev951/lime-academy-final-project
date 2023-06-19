export class InvalidUserAddressError extends Error {
    constructor() {
        super('Invalid user address!');
    }
}
throw new InvalidUserAddressError();