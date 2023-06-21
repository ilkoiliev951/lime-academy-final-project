export class InvalidCommandInputException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Invalid command exception';
    }
}