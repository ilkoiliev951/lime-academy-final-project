import {AppDataSource} from "../data-source";

export async function fetchLockedTokenEventsByAddress(address: string): Promise<any[]> {
    try {
        await AppDataSource.connect();
        const results = await AppDataSource.query('SELECT * FROM tokens_locked_event where userAddress=$1', [address]);
        return results;
    } catch (e) {
        console.log(e)
    }
}

export async function fetchBurntTokenEventsByAddress(address: string): Promise<any[]> {
    try {
        await AppDataSource.connect();
        const results = await AppDataSource.query('SELECT * FROM tokens_burnt_event where userAddress=$1', [address]);
        return results;
    } catch (e) {
        console.log(e)
    }
}

export async function fetchMintedTokenEventsByAddress(address: string): Promise<any[]> {
    try {
        await AppDataSource.connect();
        const results = await AppDataSource.query('SELECT * FROM tokens_burnt_event where userAddress=$1', [address]);
        return results;
    } catch (e) {
        console.log(e)
    }
}

export async function fetchAllTokens(): Promise<any[]> {
    try {
        await AppDataSource.connect();
        const results = await AppDataSource.query('SELECT * FROM token');
        return results;
    } catch (e) {
        console.log(e)
    }
}