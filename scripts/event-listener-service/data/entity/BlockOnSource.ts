import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('block_on_source')
export class BlockOnSource {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenSymbol: string

    @Column()
    tokenName: string

    @Column()
    tokenAddress: string

    @Column()
    tokenType: string

    @Column()
    la: string
}