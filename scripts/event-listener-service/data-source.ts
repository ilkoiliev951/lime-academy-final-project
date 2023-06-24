import "reflect-metadata"
import { DataSource } from "typeorm"
// import { TransferRequest } from "./data/entity/TransferRequest"
// import { TokensBurnt } from "./data/entity/TokensBurnt"
// import {TokensMinted } from "./data/entity/TokensMinted"
// import { TokensReleased } from "./data/entity/TokensReleased"
// import { TokensLocked } from "./data/entity/TokensLocked"
// import { User } from "./data/entity/User"
// import { Token } from "./data/entity/Token"
// import { TokenBalance } from "./data/entity/TokenBalance"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "developer",
    password: "developer",
    database: "bridge",
    synchronize: true,
    logging: true,
    entities: ['./data/entity/*.ts'],
    subscribers: [],
    migrations: [],
})