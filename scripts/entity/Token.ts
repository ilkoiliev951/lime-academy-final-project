import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('token')
export class Token {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenSymbol: string

    @Column()
    tokenName: string

    @Column()
    tokenAddress: string

    @Column()
    tokenType: string

    @Column()
    chainId: string

    @Column()
    transactionVerified?: boolean

    constructor(tokenSymbol: string, tokenName: string, tokenAddress: string, tokenType: string, chainId: string) {
        this.tokenSymbol = tokenSymbol;
        this.tokenName = tokenName;
        this.tokenAddress = tokenAddress;
        this.tokenType = tokenType;
        this.chainId = chainId;
    }
}