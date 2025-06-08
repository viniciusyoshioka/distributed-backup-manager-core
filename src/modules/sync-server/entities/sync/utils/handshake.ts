
export interface HandshakeProtocol {
  version: number
  compatiblePreviousClientVersions: number[]
}


export const HANDSHAKE_PROTOCOLS: HandshakeProtocol[] = [
  {
    version: 1,
    compatiblePreviousClientVersions: [],
  },
]


export const CURRENT_HANDSHAKE_PROTOCOL = HANDSHAKE_PROTOCOLS
  .reduce<HandshakeProtocol>((acc, current) => {
    if (current.version > acc.version) {
      return current
    }
    return acc
  }, HANDSHAKE_PROTOCOLS[0])
