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
}