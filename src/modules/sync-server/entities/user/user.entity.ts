import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string

  @Column({ name: 'name', type: 'text' })
  name!: string

  @Column({ name: 'email', type: 'text' })
  email!: string

  @Column({ name: 'password', type: 'text' })
  password!: string

  @Column({ name: 'created_at', type: 'text', default: () => "strftime('%Y-%m-%d %H:%M:%f', 'now')" })
  createdAt!: string

  @Column({ name: 'updated_at', type: 'text', default: () => "strftime('%Y-%m-%d %H:%M:%f', 'now')" })
  updatedAt!: string
}
