import { UserPayloadDTO } from '../entities'


export type WithAuthUser<T> = T & {
  user: UserPayloadDTO
}
