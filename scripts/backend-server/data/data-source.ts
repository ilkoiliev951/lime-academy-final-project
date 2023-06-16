import "reflect-metadata"
import { DataSource } from "typeorm"
import { TransferRequest } from "./entity/TransferRequest"
import { TokensBurned } from "./entity/TokensBurned"
import {TokensMinted } from "./entity/TokensMinted"
import { TokensReleased } from "./entity/TokensReleased"
import { TokensLocked } from "./entity/TokensLocked"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "developer",
    password: "developer",
    database: "bridge-db",
    synchronize: true,
    logging: true,
    entities: [TokensReleased, TokensLocked, TokensMinted, TokensBurned, TransferRequest],
    subscribers: [],
    migrations: [],
})