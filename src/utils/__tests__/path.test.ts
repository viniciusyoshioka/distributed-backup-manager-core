import process from 'node:process'

import { Path, PathType } from '../path'


describe('Teste Path', () => {


  const cwdPath = process.cwd()


  it('should return cwd when no path is provided', () => {
    const path = new Path()
    expect(path.relativePath).toBe('')
    expect(path.absolutePath).toBe(cwdPath)
  })

  it('should not add cwdPath prefix when an absolute path is provided', () => {
    const pathSegments = ['', 'path', 'to', 'nowhere']
    const absolutePath = pathSegments.join(Path.separator)
    const path = new Path(absolutePath)

    expect(Path.isAbsolute(absolutePath)).toBe(true)
    expect(path.relativePath).toBeNull()
    expect(path.absolutePath).toBe(absolutePath)
    expect(path.absolutePath.startsWith(cwdPath)).toBe(false)
  })

  it('should not throw when the path does not exists', () => {
    const pathSegments = ['path', 'to', 'nowhere']

    expect(() => new Path(...pathSegments)).not.toThrow()
  })

  it('should set Path.type to be PENDING when the path does not exists', () => {
    const pathSegments = ['path', 'to', 'nowhere']

    const path = new Path(...pathSegments)

    expect(path.type).toBe(PathType.PENDING)
  })

  it('should return the relative path relative to the current working directory', () => {
    const pathSegments = ['src', 'utils', 'path.ts']
    const path = new Path(...pathSegments)

    const relativePathExpected = pathSegments.join(Path.separator)

    expect(path.getRelativePathToRoot(cwdPath)).toBe(relativePathExpected)
  })


  describe('Test with files', () => {

    const pathSegments = ['src', 'utils', 'path.ts']
    const path = new Path(...pathSegments)

    it('should return the correct relative and absolute paths', () => {
      const relativePath = pathSegments.join(Path.separator)
      expect(path.relativePath).toBe(relativePath)

      const absolutePath = cwdPath.concat(Path.separator).concat(relativePath)
      expect(path.absolutePath).toBe(absolutePath)
    })

    it('should return the file name', () => {
      expect(path.baseName).toBe('path.ts')
    })

    it('should return the file extension', () => {
      expect(path.fileExtension).toBe('.ts')
    })

    it('should return FILE type', () => {
      expect(path.type).toBe(PathType.FILE)
    })
  })


  describe('Test Path for folders', () => {

    const pathSegments = ['src', 'utils', '__tests__']
    const path = new Path(...pathSegments)

    it('should return the correct relative and absolute paths', () => {
      const relativePath = pathSegments.join(Path.separator)
      expect(path.relativePath).toBe(relativePath)

      const absolutePath = cwdPath.concat(Path.separator).concat(relativePath)
      expect(path.absolutePath).toBe(absolutePath)
    })

    it('should return the folder name', () => {
      expect(path.baseName).toBe('__tests__')
    })

    it('should return null as file extension', () => {
      expect(path.fileExtension).toBe(null)
    })

    it('should return DIR type', () => {
      expect(path.type).toBe(PathType.DIR)
    })
  })

  // TODO: Test other path types
})
