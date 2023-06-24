import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import {BigNumber} from "ethers";

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
}