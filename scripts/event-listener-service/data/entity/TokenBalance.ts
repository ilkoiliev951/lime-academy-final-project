import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import {BigNumber} from "ethers";

@Entity("token_balance")
export class TokenBalance{
    @PrimaryGeneratedColumn()
    id: number

    // one to one relationship with token

    // token bridge balance

    // bidirectional balance - user

    // chainId
}