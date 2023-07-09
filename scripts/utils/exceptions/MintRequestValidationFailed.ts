export class MintRequestValidationFailed extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Validation of mint request failed';
    }
}