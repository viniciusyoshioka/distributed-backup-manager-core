import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'

import { Path, PathType } from '../file-system'


export enum HashType {
  SHA_256 = 'sha256',
}


export async function hash(path: Path, hashType = HashType.SHA_256): Promise<string | null> {
  if (path.type !== PathType.FILE) {
    return null
  }


  const fileStream = createReadStream(path.absolutePath)
  const hashStream = createHash(hashType)

  try {
    for await (const chunk of fileStream) {
      hashStream.update(chunk as string | Buffer)
    }

    const digestedHash = hashStream.digest('hex')
    hashStream.destroy()
    fileStream.destroy()
    return digestedHash
  } catch (error) {
    hashStream.destroy()
    fileStream.destroy()

    if (error instanceof Error) {
      throw error
    }
    const errorMessage = String(error)
    throw new Error(errorMessage)
  }
}
