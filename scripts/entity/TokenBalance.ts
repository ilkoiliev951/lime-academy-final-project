import {Column, Entity, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import {User} from "./User";

@Entity('token_balance')
export class TokenBalance{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userAddress: string

    @Column()
    tokenSymbolSource: string

    @Column()
    tokenSymbolTarget: string

    @ManyToOne(() => User, user => user.balances)
    user: User;

    @Column({ type: "numeric", precision: 78, scale: 2 })
    userBalanceSource: string

    @Column({ type: "numeric", precision: 78, scale: 2 })
    userBalanceTarget: string

    constructor(userAddress: string, tokenSymbolSource: string, tokenSymbolTarget: string, userBalanceSource: string, userBalanceTarget: string) {
        this.userAddress = userAddress;
        this.tokenSymbolSource = tokenSymbolSource;
        this.tokenSymbolTarget = tokenSymbolTarget;
        this.userBalanceSource = userBalanceSource;
        this.userBalanceTarget = userBalanceTarget;
    }
}