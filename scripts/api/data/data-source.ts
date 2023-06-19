import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "developer",
    password: "developer",
    database: "bridge-db",
    synchronize: true,
    logging: true,
    entities: [],
    subscribers: [],
    migrations: [],
})