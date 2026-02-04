const config = require('./src/config/config');
const configMigrations = {
    mongodb: {
        url: config.db.dbUrl,
        databaseName: config.db.dbName,
        options: {} // Пустой объект вместо устаревших параметров
    },
    moduleSystem: 'commonjs',
    migrationsDir: "migrations",
    changelogCollectionName: "migrations",
    migrationFileExtension: ".js",
    useFileHash: false
};
module.exports = configMigrations;