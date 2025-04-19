import { isIP } from 'node:net'


export enum IpVersion {
  IPv4 = 'IPv4',
  IPv6 = 'IPv6',
}


// TODO: Convert localhost address to IP address
export class IP {


  readonly address: string
  readonly version: IpVersion


  constructor(address: string) {
    const addressIsValid = IP.isValid(address)
    if (!addressIsValid) {
      throw new Error(`Invalid IP address: ${address}`)
    }

    this.address = address
    this.version = IP.getVersion(address)
  }


  static isValid(address: string): boolean {
    return isIP(address) !== 0
  }

  static getVersion(address: string): IpVersion {
    const addressIsValid = this.isValid(address)
    if (!addressIsValid) {
      throw new Error(`Invalid IP address: ${address}`)
    }

    const ipVersion = isIP(address)
    switch (ipVersion) {
      case 4:
        return IpVersion.IPv4
      case 6:
        return IpVersion.IPv6
      default:
        throw new Error(`Unknown IP version for address: ${address}`)
    }
  }
}
