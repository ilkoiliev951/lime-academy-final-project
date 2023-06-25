export class EventNotFound extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Event not found exception';
    }
}