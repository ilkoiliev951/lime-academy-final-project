export class MissingPrivateKeyException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Missing private key exception';
    }
}