import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('block_target')
export class BlockOnTarget {
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
    chainId: string
}