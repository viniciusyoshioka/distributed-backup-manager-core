import axios, { AxiosInstance } from 'axios'

import { assertDotEnvIsValid } from '../../../../env/index.js'
import { IpVersion, NetworkAddress } from '../../../network/index.js'
import { HandshakeProtocol } from '../../../sync-server/index.js'


export class SyncSubClient {


  private readonly client: AxiosInstance
  private readonly token: string


  constructor(serverAddress: NetworkAddress) {
    assertDotEnvIsValid()

    const { ip, port } = serverAddress
    const { address, version } = ip

    const baseURL = version === IpVersion.IPv6
      ? `http://[${address}]:${port}/api/sync/v1`
      : `http://${address}:${port}/api/sync/v1`

    this.client = axios.create({ baseURL })
    this.token = process.env.ACCESS_TOKEN
  }


  async handshake(): Promise<HandshakeProtocol> {
    const { data } = await this.client.get<HandshakeProtocol>('/handshake', {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    return data
  }
}
