import "reflect-metadata"
import { DataSource } from "typeorm"
import {Token} from "../../entity/Token";
import {TokensLocked} from "../../entity/TokensLocked";
import {TokensBurnt} from "../../entity/TokensBurnt";
import {TokensMinted} from "../../entity/TokensMinted";
import {TokensReleased} from "../../entity/TokensReleased";
import {BlockOnTarget} from "../../entity/BlockOnTarget";
import {BlockOnSource} from "../../entity/BlockOnSource";
import {User} from "../../entity/User";
import {TokenBalance} from "../../entity/TokenBalance";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "developer",
    password: "developer",
    database: "bridge_db",
    synchronize: true,
    logging: true,
    entities: [Token,
        TokensLocked,
        TokensBurnt,
        TokensMinted,
        TokensReleased,
        BlockOnTarget,
        BlockOnSource,
        User,
        TokenBalance,
    ],
    subscribers: [],
    migrations: [],
})