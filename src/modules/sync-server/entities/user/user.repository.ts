import { DataSource, Repository } from 'typeorm'

import { UserEntity } from './user.entity'


export class UserRepository extends Repository<UserEntity> {


  private readonly dataSource: DataSource


  constructor(dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager())
    this.dataSource = dataSource
  }
}
