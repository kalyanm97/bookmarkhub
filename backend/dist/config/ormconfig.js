"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ormConfig = void 0;
const isProd = String(process.env.NODE_ENV) === 'production';
exports.ormConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'bookmarkhub',
    autoLoadEntities: true,
    synchronize: !isProd,
    migrations: [process.env.TYPEORM_MIGRATIONS_PATH || 'dist/migrations/*{.ts,.js}'],
    migrationsTableName: process.env.TYPEORM_MIGRATIONS_TABLE || 'migrations',
};
