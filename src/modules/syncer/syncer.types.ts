import { Queue } from '../../utils'


export interface Diffs {
  pathsToCreate: Queue<string>
  pathsToUpdate: Queue<string>
  pathsToDelete: Queue<string>
}
