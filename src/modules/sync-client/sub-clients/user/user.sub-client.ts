import axios, { AxiosInstance } from 'axios'

import { IpVersion, NetworkAddress } from '../../../network/index.js'
import { CreateUserDTO, UserCredentialsDTO, UserTokenDTO, UserWithoutPasswordDTO } from '../../../sync-server/index.js'


export class UserSubClient {


  private readonly client: AxiosInstance


  constructor(serverAddress: NetworkAddress) {
    const { address, version } = serverAddress.ip
    const { port } = serverAddress

    const baseURL = version === IpVersion.IPv6
      ? `http://[${address}]:${port}/api/user/v1`
      : `http://${address}:${port}/api/user/v1`

    this.client = axios.create({ baseURL })
  }


  async createUser(createUser: CreateUserDTO): Promise<UserWithoutPasswordDTO> {
    const { data } = await this.client.post<UserWithoutPasswordDTO>('/', createUser)

    return data
  }

  async deleteUser(id: string): Promise<UserWithoutPasswordDTO> {
    const { data } = await this.client.delete<UserWithoutPasswordDTO>(`/${id}`)

    return data
  }

  async loginUser(userCredentials: UserCredentialsDTO): Promise<UserTokenDTO> {
    const { data } = await this.client.post<UserTokenDTO>('/login', userCredentials)

    return data
  }
}
