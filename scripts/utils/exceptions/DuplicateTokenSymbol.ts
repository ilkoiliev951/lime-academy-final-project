export class DuplicateTokenSymbol extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Duplicate token symbol exception';
    }
}