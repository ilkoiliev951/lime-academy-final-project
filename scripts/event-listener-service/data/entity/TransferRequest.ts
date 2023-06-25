import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('transfer_request')
export class TransferRequest {

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
    sourceChain: string

    @Column()
    targetChain: string

    @Column()
    timestamp: string

    constructor(tokenSymbol: string, tokenAddress: string, userAddress: string, amount: string, sourceChain: string, targetChain: string, timestamp: string) {
        this.tokenSymbol = tokenSymbol;
        this.tokenAddress = tokenAddress;
        this.userAddress = userAddress;
        this.amount = amount;
        this.sourceChain = sourceChain;
        this.targetChain = targetChain;
        this.timestamp = timestamp;
    }
}