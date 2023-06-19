export class InvalidUserAddressError extends Error {
    constructor() {
        super('Provided user address is invalid!');
        this.name = 'Invalid command exception';
    }
}