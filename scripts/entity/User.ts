import { OneToMany, Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import {TokenBalance} from "./TokenBalance";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userAddress: string

    @OneToMany(() => TokenBalance, balance => balance.user)
    balances: TokenBalance[]

    constructor(userAddress: string, balances: TokenBalance[]) {
        this.userAddress = userAddress;
        this.balances = balances;
    }
}