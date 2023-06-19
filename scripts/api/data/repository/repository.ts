import { getConnection } from 'typeorm';

export async function fetchLockedTokenEvents(): Promise<any[]> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
        await queryRunner.connect();
        const results = await queryRunner.query('SELECT * FROM tokens_locked_event where claimedOnTarget is false ');
        return results;
    } finally {
        await queryRunner.release();
    }
}

export async function fetchBurntTokenEvents(): Promise<any[]> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
        await queryRunner.connect();
        const results = await queryRunner.query('SELECT * FROM tokens_burnt_event');
        return results;
    } finally {
        await queryRunner.release();
    }
}

export async function fetchBridgedTokensByWallet(address: string): Promise<any[]> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
        await queryRunner.connect();
        const results = await queryRunner.query('SELECT * FROM transfer_request where userAddress=$1', [address]);
        return results;
    } finally {
        await queryRunner.release();
    }
}

export async function fetchAllBridgedTokenAmounts(): Promise<any[]> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
        await queryRunner.connect();
        const results = await queryRunner.query('SELECT * FROM transfer_request');
        return results;
    } finally {
        await queryRunner.release();
    }
}