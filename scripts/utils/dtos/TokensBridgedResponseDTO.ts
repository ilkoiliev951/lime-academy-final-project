
export class TokensBridgedResponseDTO {
    tokenSymbol: string
    tokenAddress: string
    amount: string
    userAddress: string
    fromChainId: string
    toChainId: string
    timestamp: string

    constructor(tokenSymbol: string, tokenAddress: string, amount: string, userAddress: string, fromChainId: string, toChainId: string, timestamp: string) {
        this.tokenSymbol = tokenSymbol;
        this.tokenAddress = tokenAddress;
        this.amount = amount;
        this.userAddress = userAddress;
        this.fromChainId = fromChainId;
        this.toChainId = toChainId;
        this.timestamp = timestamp;
    }
}