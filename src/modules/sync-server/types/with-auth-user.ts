import type { UserPayloadDTO } from '../entities/index.ts'


export type WithAuthUser<T> = T & {
  user: UserPayloadDTO
}
