import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('block_target')
export class BlockOnTarget {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    lastProcessedBlockId: number

    @Column()
    timestamp: string
}