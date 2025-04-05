import process from 'node:process'

import { Path, PathType } from '../path'


describe('Teste Path', () => {


  const cwdPath = process.cwd()


  it('should return cwd when no path is provided', () => {
    const path = new Path()
    expect(path.relativePath).toBe('')
    expect(path.absolutePath).toBe(cwdPath)
  })

  it('should throw when the path does not exists', () => {
    const pathSegments = ['path', 'to', 'nowhere']

    const relativePath = pathSegments.join(Path.separator)
    const absolutePath = cwdPath.concat(Path.separator).concat(relativePath)

    expect(() => {
      new Path(...pathSegments)
    }).toThrow(`ENOENT: no such file or directory, lstat '${absolutePath}'`)
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
