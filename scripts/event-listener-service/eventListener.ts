import process from "process";

const dataSource = require('./data-source')


export async function main() {
    console.error('started')
    await dataSource.AppDataSource.connect();

    console.log('Connected')
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


