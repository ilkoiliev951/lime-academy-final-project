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

    @Column( {nullable: true })
    transactionVerified?: boolean

    constructor(tokenSymbol: string, tokenAddress: string, userAddress: string, amount: string, chainId: string, lockedInContract: string, claimedOnTarget: boolean, timestamp: string, active: boolean) {
        this.tokenSymbol = tokenSymbol;
        this.tokenAddress = tokenAddress;
        this.userAddress = userAddress;
        this.amount = amount;
        this.chainId = chainId;
        this.lockedInContract = lockedInContract;
        this.claimedOnTarget = claimedOnTarget;
        this.timestamp = timestamp;
        this.active = active;
    }
}