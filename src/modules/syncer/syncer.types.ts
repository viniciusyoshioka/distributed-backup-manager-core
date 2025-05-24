import { Queue } from '../../utils/index.js'
import { Path } from '../file-system/index.js'


export interface GetDiffsParams {
  sourceParentPath: Path
  destinationParentPath: Path
  sourceChildrenNames: string[]
  destinationChildrenNames: string[]
}


export interface PathDiffs {
  pathsToCreate: string[]
  pathsToUpdate: string[]
  pathsToDelete: string[]
  childrenPathsToScan: string[]
}


export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}


export interface Diffs {
  pathsToCreate: Queue<string>
  pathsToUpdate: Queue<string>
  pathsToDelete: Queue<string>
}
