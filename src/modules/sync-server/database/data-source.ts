import process from 'node:process'
import { DataSource } from 'typeorm'

import { CreateUsersTable1746396371784 } from './migrations/1746396371784-CreateUsersTable'


if (!process.env.SYNC_SERVER_DATABASE_PATH) {
  throw new Error('SYNC_SERVER_DATABASE_PATH is not defined')
}


export const dataSource = new DataSource({
  type: 'sqlite',
  database: process.env.SYNC_SERVER_DATABASE_PATH,
  entities: [
    '../entities/**/*.entity.ts',
  ],
  migrations: [
    CreateUsersTable1746396371784,
  ],
  synchronize: false,
})
