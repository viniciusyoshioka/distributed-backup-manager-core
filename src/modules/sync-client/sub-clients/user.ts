import axios, { AxiosInstance } from 'axios'

import { IpVersion, NetworkAddress } from '../../../modules/network'


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
}
