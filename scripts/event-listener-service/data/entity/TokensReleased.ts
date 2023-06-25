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

    @Column()
    transactionVerified?: boolean

    constructor (tokenSymbol: string, tokenAddress: string, userAddress: string, amount: string, chainId: string, timestamp: string) {
        this.tokenSymbol = tokenSymbol;
        this.tokenAddress = tokenAddress;
        this.userAddress = userAddress;
        this.amount = amount;
        this.chainId = chainId;
        this.timestamp = timestamp;
    }
}