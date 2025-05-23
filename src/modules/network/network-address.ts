import { IP } from './ip.js'


export class NetworkAddress {


  readonly ip: IP
  readonly port: string


  constructor(ip: string | IP, port: string | number) {
    this.ip = ip instanceof IP ? ip : new IP(ip)
    this.port = NetworkAddress.normalizePort(port)
  }


  private static normalizePort(port: string | number): string {
    this.assertPortIsValid(port)
    return String(port)
  }

  private static assertPortIsValid(port: string | number): void {
    if (typeof port === 'string') {
      port = Number.parseInt(port)
    }

    if (Number.isNaN(port)) {
      throw new Error('Expected port to be a number')
    }
    if (!Number.isFinite(port)) {
      throw new Error('Expected port to be a finite number')
    }
    if (!Number.isInteger(port)) {
      throw new Error('Expected port to be an integer')
    }
    if (port <= 0) {
      throw new Error('Expected port to be greater than 0')
    }
  }

  static isPortValid(port: string | number): boolean {
    try {
      this.assertPortIsValid(port)
      return true
    } catch (error) {
      return false
    }
  }
}
