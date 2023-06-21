export class EntityNotFoundException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Entity not found exception';
    }
}