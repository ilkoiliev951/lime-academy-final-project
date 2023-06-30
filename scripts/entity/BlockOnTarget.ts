import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('block_on_target')
export class BlockOnTarget {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    lastProcessedBlockId: number

    @Column()
    timestamp: string

    constructor(lastProcessedBlockId: number, timestamp: string) {
        this.lastProcessedBlockId = lastProcessedBlockId;
        this.timestamp = timestamp;
    }
}