import process from 'node:process'

import { Path, PathType } from '../path'


describe('Teste Path', () => {


  const cwdPath = process.cwd()


  it('should create Path correctly', () => {
    const pathSegments = ['', 'path', 'to', 'nowhere']
    const absolutePath = pathSegments.join(Path.separator)
    const path = new Path(absolutePath)

    expect(Path.isAbsolute(absolutePath)).toBe(true)
    expect(path.absolutePath).toBe(absolutePath)
  })

  it('should throw when the given path is not absolute', () => {
    const pathSegments = ['src', 'utils', 'path.ts']
    expect(() => new Path(pathSegments)).toThrow('Path must be absolute')
  })

  it('should not throw when the path does not exists', () => {
    const pathSegments = [cwdPath, 'path', 'to', 'nowhere']

    expect(() => new Path(pathSegments)).not.toThrow()
  })

  it(`should set Path.type to ${PathType.UNKNOWN} when the path does not exists`, () => {
    const pathSegments = [cwdPath, 'path', 'to', 'nowhere']

    const path = new Path(pathSegments)

    expect(path.type).toBe(PathType.UNKNOWN)
  })

  it('should return the relative path relative to the current working directory', () => {
    const relativePathSegments = ['src', 'utils', 'path.ts']
    const absolutePathSegments = [cwdPath, ...relativePathSegments]
    const path = new Path(absolutePathSegments)

    const relativePathExpected = relativePathSegments.join(Path.separator)

    expect(path.getRelativePathToRoot(cwdPath)).toBe(relativePathExpected)
  })


  describe('Test with files', () => {

    const pathSegments = [cwdPath, 'src', 'utils', 'path.ts']
    const path = new Path(pathSegments)

    it('should return the correct absolute path', () => {
      const absolutePath = pathSegments.join(Path.separator)
      expect(path.absolutePath).toBe(absolutePath)
    })

    it('should return the file name', () => {
      expect(path.baseName).toBe('path.ts')
    })

    it('should return the file extension', () => {
      expect(path.fileExtension).toBe('.ts')
    })

    it(`should return ${PathType.FILE} type`, () => {
      expect(path.type).toBe(PathType.FILE)
    })
  })


  describe('Test Path for folders', () => {

    const pathSegments = [cwdPath, 'src', 'utils', '__tests__']
    const path = new Path(pathSegments)

    it('should return the correct absolute path', () => {
      const absolutePath = pathSegments.join(Path.separator)
      expect(path.absolutePath).toBe(absolutePath)
    })

    it('should return the folder name', () => {
      expect(path.baseName).toBe('__tests__')
    })

    it('should return null as file extension', () => {
      expect(path.fileExtension).toBe(null)
    })

    it(`should return ${PathType.DIR} type`, () => {
      expect(path.type).toBe(PathType.DIR)
    })
  })


  // TODO: Test other path types
})
