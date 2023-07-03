import {ethers} from "hardhat";
import {TypedDataDomain} from "ethers";

export async function generateERC20PermitSignature (
    signer,
    name,
    version,
    chainId,
    tokenAddress,
    userAddress,
    spender,
    nonce,
    deadline,
    value) {

    const { v, r, s } = ethers.utils.splitSignature(
        await signer._signTypedData(
            {
                name: name,
                version: version,
                chainId: chainId,
                verifyingContract: tokenAddress,
            } as TypedDataDomain,
            {
                Permit: [
                    {
                        name: "owner",
                        type: "address",
                    },
                    {
                        name: "spender",
                        type: "address",
                    },
                    {
                        name: "value",
                        type: "uint256",
                    },
                    {
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        name: "deadline",
                        type: "uint256",
                    },
                ],
            },
            {
                owner: userAddress,
                spender,
                value,
                nonce,
                deadline,
            }
        )
    );

    console.log(v)
    console.log(r)
    console.log(s)
    console.log(signer)

    return {v,r,s}
}