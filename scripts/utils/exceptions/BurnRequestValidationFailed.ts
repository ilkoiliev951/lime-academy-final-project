export class BurnRequestValidationFailed extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Validation of burn request failed';
    }
}