import {Column, Entity, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import {User} from "./User";

@Entity('token_balance')
export class TokenBalance{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number

    @Column
    tokenSymbol: string

    @ManyToOne(() => User, user => user.balances)
    user: User;

    @Column({ type: "numeric", precision: 78, scale: 2 })
    userBridgeBalance: string

    @Column()
    chainId: string

    @Column()
    transactionVerified?: boolean

    constructor(userId: number, tokenSymbol, userBridgeBalance: string, chainId: string) {
        this.userId = userId;
        this.tokenSymbol = tokenSymbol;
        this.userBridgeBalance = userBridgeBalance;
        this.chainId = chainId;
    }
}