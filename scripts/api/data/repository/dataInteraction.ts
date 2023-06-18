import { getConnection } from 'typeorm';

export async function fetchLockedTokenEvents(): Promise<any[]> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
        await queryRunner.connect();
        const results = await queryRunner.query('SELECT * FROM table1');
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
        const results = await queryRunner.query('SELECT * FROM table2');
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
        const results = await queryRunner.query('SELECT * FROM table3');
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
        const results = await queryRunner.query('SELECT * FROM table3');
        return results;
    } finally {
        await queryRunner.release();
    }
}