import fs, { CopySyncOptions, RmOptions } from 'node:fs'

import { Path, PathType } from '../../../utils'
import { FileSystem } from '../file-system'


export class LocalFileSystem extends FileSystem {
  async readDirectory(path: Path): Promise<string[] | null> {
    if (!path.exists()) {
      return []
    }
    if (path.type !== PathType.DIR) {
      return null
    }
    return fs.readdirSync(path.absolutePath)
  }


  async createDirectory(path: Path): Promise<void> {
    if (path.exists()) {
      throw new Error('Cannot create directory because something already exists in given path')
    }

    fs.mkdirSync(path.absolutePath, { recursive: true })
  }


  async deleteFile(path: Path): Promise<void> {
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

  async deleteDirectory(path: Path): Promise<void> {
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


  async copyFile(fromPath: Path, toPath: Path): Promise<void> {
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

  async copyDirectory(fromPath: Path, toPath: Path): Promise<void> {
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
