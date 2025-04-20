import fs, { CopySyncOptions, RmOptions } from 'node:fs'

import { Path, PathType } from './path'


export class FileSystem {
  // TODO: Assert path is absolute
  // TODO: Use Path class and avoid circular dependency
  exists(path: string): boolean {
    return fs.existsSync(path)
  }


  readDirectory(path: Path): string[] | null {
    const pathExists = this.exists(path.absolutePath)
    if (!pathExists) {
      return []
    }
    if (path.type !== PathType.DIR) {
      return null
    }
    return fs.readdirSync(path.absolutePath)
  }


  createDirectory(path: Path): void {
    if (path.exists()) {
      throw new Error('Cannot create directory because something already exists in given path')
    }

    fs.mkdirSync(path.absolutePath, { recursive: true })
  }


  delete(path: Path): void {
    if (path.type === PathType.FILE) {
      this.deleteFile(path)
      return
    }

    if (path.type === PathType.DIR) {
      this.deleteDirectory(path)
      return
    }

    throw new Error(`Path type ${path.type} is not supported by delete`)
  }

  deleteFile(path: Path): void {
    const pathExists = path.exists()
    if (!pathExists) {
      throw new Error('Cannot delete file because it does not exists')
    }

    if (path.type !== PathType.FILE) {
      throw new Error('Cannot delete path because it is not a file')
    }

    const rmOptions: RmOptions = {
      force: true,
      recursive: true,
    }

    fs.rmSync(path.absolutePath, rmOptions)
  }

  deleteDirectory(path: Path): void {
    const pathExists = path.exists()
    if (!pathExists) {
      throw new Error('Cannot delete directory because it does not exists')
    }

    if (path.type !== PathType.DIR) {
      throw new Error('Cannot delete path because it is not a directory')
    }

    const rmOptions: RmOptions = {
      force: true,
      recursive: true,
    }

    fs.rmSync(path.absolutePath, rmOptions)
  }


  copy(fromPath: Path, toPath: Path): void {
    if (fromPath.type === PathType.FILE) {
      this.copyFile(fromPath, toPath)
      return
    }

    if (fromPath.type === PathType.DIR) {
      this.copyDirectory(fromPath, toPath)
      return
    }

    throw new Error(`Path type ${fromPath.type} is not supported by copy`)
  }

  copyFile(fromPath: Path, toPath: Path): void {
    const fromPathExists = fromPath.exists()
    if (!fromPathExists) {
      throw new Error('Cannot copy file from fromPath to toPath because fromPath does not exists')
    }

    if (fromPath.type !== PathType.FILE) {
      throw new Error('Cannot copy fromPath because it is not a file')
    }

    const toPathExists = toPath.exists()
    if (toPathExists) {
      this.delete(toPath)
    }

    const parentPath = new Path(toPath.parentAbsolutePath)
    const parentPathExists = parentPath.exists()
    if (!parentPathExists) {
      this.createDirectory(parentPath)
    }

    fs.copyFileSync(fromPath.absolutePath, toPath.absolutePath)
  }

  copyDirectory(fromPath: Path, toPath: Path): void {
    const fromPathExists = fromPath.exists()
    if (!fromPathExists) {
      throw new Error('Cannot copy directory from fromPath to toPath because fromPath does not exists')
    }

    if (fromPath.type !== PathType.DIR) {
      throw new Error('Cannot copy fromPath because it is not a directory')
    }

    const toPathExists = toPath.exists()
    if (toPathExists) {
      this.delete(toPath)
    }

    const copySyncOptions: CopySyncOptions = {
      force: true,
      recursive: true,
    }

    fs.cpSync(fromPath.absolutePath, toPath.absolutePath, copySyncOptions)
  }
}
