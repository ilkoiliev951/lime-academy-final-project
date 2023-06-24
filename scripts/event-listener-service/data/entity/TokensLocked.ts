import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('tokens_locked_event')
export class TokensLocked {
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
    lockedInContract: string

    @Column()
    claimedOnTarget: boolean

    @Column()
    timestamp: string

    @Column()
    active: boolean
}