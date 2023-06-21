export class MissingArgumentsException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Missing arguments exception';
    }
}