import { Queue } from '../../utils/index.js'
import { Path, RelativePath } from '../file-system/index.js'


export enum HandshakeFailureReason {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VERSION_INCOMPATIBILITY = 'VERSION_INCOMPATIBILITY',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
}

export interface HandshakeResult {
  isSuccessful: boolean
  reason?: HandshakeFailureReason
}


export interface GetDiffsParams {
  sourceParentPath: Path | RelativePath
  destinationParentPath: Path | RelativePath
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
