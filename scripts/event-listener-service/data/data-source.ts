import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "developer",
    password: "developer",
    database: "bridge",
    synchronize: true,
    logging: true,
    entities: ['./../../entity/*.ts'],
    subscribers: [],
    migrations: [],
})