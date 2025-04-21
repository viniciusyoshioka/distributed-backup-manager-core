import fs, { CopySyncOptions, RmOptions } from 'node:fs'

import { Path, PathType } from '../path'
import { FileSystem } from './file-system'


export class LocalFileSystem implements FileSystem {
  exists(path: Path): boolean {
    return fs.existsSync(path.absolutePath)
  }


  private getPathType(path: Path): PathType {
    const pathExists = this.exists(path)
    if (!pathExists) {
      return PathType.NULL
    }

    const lStats = fs.lstatSync(path.absolutePath)
    if (lStats.isFile()) {
      return PathType.FILE
    }
    if (lStats.isDirectory()) {
      return PathType.DIR
    }

    if (lStats.isSymbolicLink()) {
      const stats = fs.statSync(path.absolutePath)
      if (stats.isFile()) {
        return PathType.SYMLINK_FILE
      }
      if (stats.isDirectory()) {
        return PathType.SYMLINK_DIR
      }
      return PathType.SYMLINK_OTHER
    }

    return PathType.OTHER
  }

  resolvePathType(path: Path): PathType {
    const type = this.getPathType(path)
    path.updateType(type)
    return type
  }


  readDirectory(path: Path): string[] | null {
    const pathExists = this.exists(path)
    if (!pathExists) {
      return []
    }

    this.resolvePathType(path)
    if (path.type !== PathType.DIR) {
      return null
    }

    return fs.readdirSync(path.absolutePath)
  }


  createDirectory(path: Path): void {
    const pathExists = this.exists(path)
    if (!pathExists) {
      throw new Error('Cannot create directory because path already exists')
    }

    fs.mkdirSync(path.absolutePath, { recursive: true })
  }


  delete(path: Path): void {
    this.resolvePathType(path)

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
    const pathExists = this.exists(path)
    if (!pathExists) {
      throw new Error('Cannot delete file because it does not exists')
    }

    this.resolvePathType(path)
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
    const pathExists = this.exists(path)
    if (!pathExists) {
      throw new Error('Cannot delete directory because it does not exists')
    }

    this.resolvePathType(path)
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
    this.resolvePathType(fromPath)

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
    const fromPathExists = this.exists(fromPath)
    if (!fromPathExists) {
      throw new Error('Cannot copy file from fromPath to toPath because fromPath does not exists')
    }

    this.resolvePathType(fromPath)
    if (fromPath.type !== PathType.FILE) {
      throw new Error('Cannot copy fromPath because it is not a file')
    }

    const toPathExists = this.exists(toPath)
    if (toPathExists) {
      this.delete(toPath)
    }

    const parentPath = new Path(toPath.parentAbsolutePath)
    const parentPathExists = this.exists(parentPath)
    if (!parentPathExists) {
      this.createDirectory(parentPath)
    }

    fs.copyFileSync(fromPath.absolutePath, toPath.absolutePath)
  }

  copyDirectory(fromPath: Path, toPath: Path): void {
    const fromPathExists = this.exists(fromPath)
    if (!fromPathExists) {
      throw new Error('Cannot copy directory from fromPath to toPath because fromPath does not exists')
    }

    this.resolvePathType(fromPath)
    if (fromPath.type !== PathType.DIR) {
      throw new Error('Cannot copy fromPath because it is not a directory')
    }

    const toPathExists = this.exists(toPath)
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
