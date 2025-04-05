import process from 'node:process'

import { hash, HashType } from '..'
import { Path, PathType } from '../../../utils'


describe('Test Hash module', () => {


  const cwd = process.cwd()

  const path = new Path('./src/modules/hash/__tests__/test_file.txt')
  const expectedSha256 = '04d2f0aa6d6415cd1671b56695b9417fce416afb0e9106f08f752f86839e3ad3'

  const mockPath = {
    absolutePath: [cwd, './src/modules/hash/__tests__/not_existent_file.txt'].join(Path.separator),
    type: PathType.FILE,
  } as Path


  it('should use sha-256 algorithm by default', async () => {
    const checksum = await hash(path)
    expect(checksum).toBe(expectedSha256)
  })

  it('should throw if the file does not exists', () => {
    expect(hash(mockPath))
      .rejects
      .toThrow(`ENOENT: no such file or directory, open '${mockPath.absolutePath}'`)
  })

  it('should return null if the path is not a file', async () => {
    const folderPath = new Path('./src/modules/hash/__tests__')
    const checksum = await hash(folderPath)
    expect(checksum).toBe(null)
  })

  it('should return the correct hash when using SHA-256 hash type', async () => {
    const checksum = await hash(path, HashType.SHA_256)
    expect(checksum).toBe(expectedSha256)
  })
})
