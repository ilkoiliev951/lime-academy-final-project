import "reflect-metadata"
import { DataSource } from "typeorm"
import { TransferRequest } from "./data/entity/TransferRequest"
import { TokensBurned } from "./data/entity/TokensBurned"
import {TokensMinted } from "./data/entity/TokensMinted"
import { TokensReleased } from "./data/entity/TokensReleased"
import { TokensLocked } from "./data/entity/TokensLocked"

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