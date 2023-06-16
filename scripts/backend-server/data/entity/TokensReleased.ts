import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import {BigNumber} from "ethers";

@Entity()
export class TokensReleased {
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
    chainId: string

    @Column()
    timestamp: string
}