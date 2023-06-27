import {JoinColumn, OneToOne, Column, Entity, PrimaryGeneratedColumn, ManyToOne} from "typeorm"
import {Token} from "./Token";
import {User} from "./User";

@Entity('token_balance')
export class TokenBalance{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number

    @OneToOne(() => Token)
    @JoinColumn()
    token: Token

    @ManyToOne(() => User, user => user.balances)
    user: User;

    @Column({ type: "numeric", precision: 78, scale: 2 })
    userBridgeBalance: string

    @Column()
    chainId: string

    @Column()
    transactionVerified?: boolean

    constructor(userId: number, token: Token, userBridgeBalance: string, chainId: string) {
        this.userId = userId;
        this.token = token;
        this.userBridgeBalance = userBridgeBalance;
        this.chainId = chainId;
    }
}