import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import {BigNumber} from "ethers";

@Entity("token")
export class Token {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenSymbol: string

    @Column()
    tokenName: string

    @Column()
    tokenAddress: string

    // @Column()
    // initialLiquidity: BigNumber

    @Column()
    chainId: string
}