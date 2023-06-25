import { OneToMany, Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import {TokenBalance} from "./TokenBalance";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenSymbol: string

    @Column()
    tokenAddress: string

    @Column()
    userAddress: string

    @OneToMany(() => TokenBalance, balance => balance.user)
    balances: TokenBalance[];

    constructor(tokenSymbol: string, tokenAddress: string, userAddress: string, balances: TokenBalance[]) {
        this.tokenSymbol = tokenSymbol;
        this.tokenAddress = tokenAddress;
        this.userAddress = userAddress;
        this.balances = balances;
    }
}