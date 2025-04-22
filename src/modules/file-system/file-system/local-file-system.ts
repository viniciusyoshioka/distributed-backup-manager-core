import fs, { RmOptions } from 'node:fs'

import { Path, PathType } from '../path'
import { FileSystem } from './file-system'


export class LocalFileSystem implements FileSystem {
  async exists(path: Path): Promise<boolean> {
    try {
      await fs.promises.access(path.absolutePath, fs.constants.F_OK)
      return true
    } catch (error) {
      return false
    }
  }


  private async getPathType(path: Path): Promise<PathType> {
    const pathExists = await this.exists(path)
    if (!pathExists) {
      return PathType.NULL
    }

    try {
      const lStats = await fs.promises.lstat(path.absolutePath)
      if (lStats.isFile()) {
        return PathType.FILE
      }
      if (lStats.isDirectory()) {
        return PathType.DIR
      }

      if (lStats.isSymbolicLink()) {
        const stats = await fs.promises.stat(path.absolutePath)
        if (stats.isFile()) {
          return PathType.SYMLINK_FILE
        }
        if (stats.isDirectory()) {
          return PathType.SYMLINK_DIR
        }
        return PathType.SYMLINK_OTHER
      }

      return PathType.OTHER
    } catch (error) {
      return PathType.NULL
    }
  }

  async resolvePathType(path: Path): Promise<PathType> {
    const type = await this.getPathType(path)
    path.updateType(type)
    return type
  }


  async readDirectory(path: Path): Promise<string[] | null> {
    const pathExists = await this.exists(path)
    if (!pathExists) {
      return []
    }

    await this.resolvePathType(path)
    if (path.type !== PathType.DIR) {
      return null
    }

    return await fs.promises.readdir(path.absolutePath)
  }


  async createDirectory(path: Path): Promise<void> {
    const pathExists = await this.exists(path)
    if (pathExists) {
      throw new Error('Cannot create directory because path already exists')
    }

    await fs.promises.mkdir(path.absolutePath, { recursive: true })
  }


  private async delete(path: Path): Promise<void> {
    await this.resolvePathType(path)

    if (path.type === PathType.FILE) {
      await this.deleteFile(path)
      return
    }

    if (path.type === PathType.DIR) {
      await this.deleteDirectory(path)
      return
    }

    throw new Error(`Path type ${path.type} is not supported by delete`)
  }

  async deleteFile(path: Path): Promise<void> {
    const pathExists = await this.exists(path)
    if (!pathExists) {
      throw new Error('Cannot delete file because it does not exists')
    }

    await this.resolvePathType(path)
    if (path.type !== PathType.FILE) {
      throw new Error('Cannot delete path because it is not a file')
    }

    const rmOptions: RmOptions = {
      force: true,
      recursive: true,
    }

    await fs.promises.rm(path.absolutePath, rmOptions)
  }

  async deleteDirectory(path: Path): Promise<void> {
    const pathExists = await this.exists(path)
    if (!pathExists) {
      throw new Error('Cannot delete directory because it does not exists')
    }

    await this.resolvePathType(path)
    if (path.type !== PathType.DIR) {
      throw new Error('Cannot delete path because it is not a directory')
    }

    const rmOptions: RmOptions = {
      force: true,
      recursive: true,
    }

    await fs.promises.rm(path.absolutePath, rmOptions)
  }


  async copyFile(fromPath: Path, toPath: Path): Promise<void> {
    const fromPathExists = await this.exists(fromPath)
    if (!fromPathExists) {
      throw new Error('Cannot copy file from fromPath to toPath because fromPath does not exists')
    }

    await this.resolvePathType(fromPath)
    if (fromPath.type !== PathType.FILE) {
      throw new Error('Cannot copy fromPath because it is not a file')
    }

    const toPathExists = await this.exists(toPath)
    if (toPathExists) {
      await this.delete(toPath)
    }

    const parentPath = new Path(toPath.parentAbsolutePath)
    const parentPathExists = await this.exists(parentPath)
    if (!parentPathExists) {
      await this.createDirectory(parentPath)
    }

    await fs.promises.copyFile(fromPath.absolutePath, toPath.absolutePath)
  }


  async moveFile(fromPath: Path, toPath: Path): Promise<void> {
    const fromPathExists = await this.exists(fromPath)
    if (!fromPathExists) {
      throw new Error('Cannot move file from fromPath to toPath because fromPath does not exists')
    }

    await this.resolvePathType(fromPath)
    if (fromPath.type !== PathType.FILE) {
      throw new Error('Cannot move fromPath because it is not a file')
    }

    const toPathExists = await this.exists(toPath)
    if (toPathExists) {
      await this.delete(toPath)
    }

    const parentPath = new Path(toPath.parentAbsolutePath)
    const parentPathExists = await this.exists(parentPath)
    if (!parentPathExists) {
      await this.createDirectory(parentPath)
    }

    await fs.promises.rename(fromPath.absolutePath, toPath.absolutePath)
  }
}
