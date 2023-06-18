import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import {BigNumber} from "ethers";

@Entity("transfer_request")
export class TransferRequest {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenSymbol: string

    @Column()
    tokenAddress: string

    @Column()
    userAddress: string

    @Column()
    amount: BigNumber

    @Column()
    sourceChain: string

    @Column()
    targetChain: string


    // TODO: Join with other events here

    @Column()
    timestamp: string
}