import fs from "fs";

// Logger
export const LOGGER = new console.Console(fs.createWriteStream("log/main_api.log"));