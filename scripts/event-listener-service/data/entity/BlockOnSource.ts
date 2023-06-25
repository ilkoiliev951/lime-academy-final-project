import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('block_on_source')
export class BlockOnSource {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    lastProcessedBlockId: number

    @Column()
    timestamp: string
}