export class TransactionValidationFailed extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Failed to validate transaction block inclusion';
    }
}