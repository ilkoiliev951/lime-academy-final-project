import { getConnection } from 'typeorm';

export async function fetchLockedTokenEventsByAddress(address: string): Promise<any[]> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
        await queryRunner.connect();
        const results = await queryRunner.query('SELECT * FROM tokens_locked_event where userAddress=$1', [address]);
        return results;
    } finally {
        await queryRunner.release();
    }
}

export async function fetchBurntTokenEventsByAddress(address: string): Promise<any[]> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
        await queryRunner.connect();
        const results = await queryRunner.query('SELECT * FROM tokens_burnt_event where userAddress=$1', [address]);
        return results;
    } finally {
        await queryRunner.release();
    }
}