import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('tokens_released_event')
export class TokensReleased {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenSymbol: string

    @Column()
    tokenAddress: string

    @Column()
    userAddress: string

    @Column({ type: "numeric", precision: 78, scale: 2 })
    amount: string

    @Column()
    chainId: string

    @Column()
    timestamp: string
}