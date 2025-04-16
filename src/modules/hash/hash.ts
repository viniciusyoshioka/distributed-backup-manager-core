import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'

import { Path, PathType } from '../../utils'


export enum HashType {
  SHA_256 = 'sha256',
}


// TODO: Add validation to assert hashType is a valid enum value
export async function hash(path: Path, hashType = HashType.SHA_256): Promise<string | null> {
  if (path.type !== PathType.FILE) {
    return null
  }


  const hashStream = createHash(hashType)
  const fileStream = createReadStream(path.absolutePath)


  return await new Promise<string>((resolve, reject) => {
    hashStream.on('error', error => {
      hashStream.destroy()
      fileStream.destroy()
      reject(error)
    })


    fileStream.on('data', chunk => {
      hashStream.update(chunk)
    })

    fileStream.on('end', () => {
      const digestedHash = hashStream.digest('hex')

      hashStream.destroy()
      fileStream.destroy()
      resolve(digestedHash)
    })

    fileStream.on('error', error => {
      hashStream.destroy()
      fileStream.destroy()
      reject(error)
    })
  })
}
