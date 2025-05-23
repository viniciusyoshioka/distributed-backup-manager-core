import process from 'node:process'

import { LocalFileSystem } from '../../file-system/index.js'
import { Path } from '../path.js'
import { PathType } from '../path.types.js'


// TODO: Test other path types
// TODO: Test other Path properties and methods
describe('Test Path', () => {


  const cwd = process.cwd()
  const localFileSystem = new LocalFileSystem()


  it('should create Path correctly', () => {
    const pathSegments = [cwd, 'src', 'modules', 'file-system', 'path', '__tests__', 'path.test.ts']
    const absolutePath = Path.join(pathSegments)
    const path = new Path(absolutePath)

    expect(Path.isAbsolute(absolutePath)).toBe(true)
    expect(path.absolutePath).toBe(absolutePath)
  })

  it('should throw when the given path is not absolute', () => {
    const pathSegments = ['src', 'modules', 'file-system', 'path', '__tests__', 'path.test.ts']
    expect(() => new Path(pathSegments)).toThrow('Path must be absolute')
  })

  it('should not throw when the path does not exists', () => {
    const pathSegments = [cwd, 'path', 'to', 'nowhere']

    expect(() => new Path(pathSegments)).not.toThrow()
  })

  it(`should set Path.type to ${PathType.NULL} when the path does not exists`, async () => {
    const pathSegments = [cwd, 'path', 'to', 'nowhere']

    const path = new Path(pathSegments)
    await localFileSystem.resolvePathType(path)

    expect(path.type).toBe(PathType.NULL)
  })

  it('should return the relative path relative to the current working directory', () => {
    const relativePathSegments = ['src', 'modules', 'file-system', 'path', '__tests__', 'path.test.ts']
    const absolutePathSegments = [cwd, ...relativePathSegments]
    const path = new Path(absolutePathSegments)

    const relativePathExpected = Path.join(relativePathSegments)

    expect(path.getRelativePathToRoot(cwd)).toBe(relativePathExpected)
  })


  describe('Test with files', () => {

    const pathSegments = [cwd, 'src', 'modules', 'file-system', 'path', '__tests__', 'path.test.ts']
    const path = new Path(pathSegments)

    it('should return the correct absolute path', () => {
      const absolutePath = Path.join(pathSegments)
      expect(path.absolutePath).toBe(absolutePath)
    })

    it('should return the file name', () => {
      expect(path.baseName).toBe('path.test.ts')
    })

    it('should return the file extension', () => {
      expect(path.fileExtension).toBe('.ts')
    })

    it(`should return ${PathType.FILE} type`, async () => {
      await localFileSystem.resolvePathType(path)
      expect(path.type).toBe(PathType.FILE)
    })
  })


  describe('Test Path for folders', () => {

    const pathSegments = [cwd, 'src', 'modules', 'file-system', 'path', '__tests__']
    const path = new Path(pathSegments)

    it('should return the correct absolute path', () => {
      const absolutePath = Path.join(pathSegments)
      expect(path.absolutePath).toBe(absolutePath)
    })

    it('should return the folder name', () => {
      expect(path.baseName).toBe('__tests__')
    })

    it('should return null as file extension', () => {
      expect(path.fileExtension).toBe(null)
    })

    it(`should return ${PathType.DIR} type`, async () => {
      await localFileSystem.resolvePathType(path)
      expect(path.type).toBe(PathType.DIR)
    })
  })
})
