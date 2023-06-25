import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('tokens_burnt_event')
export class TokensBurnt {
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
    releasedOnSource: boolean

    @Column()
    timestamp: string

    @Column()
    transactionVerified?: boolean

    constructor(tokenSymbol: string, tokenAddress: string, userAddress: string, amount: string, chainId: string, releasedOnSource: boolean, timestamp: string) {
        this.tokenSymbol = tokenSymbol;
        this.tokenAddress = tokenAddress;
        this.userAddress = userAddress;
        this.amount = amount;
        this.chainId = chainId;
        this.releasedOnSource = releasedOnSource;
        this.timestamp = timestamp;
    }
}