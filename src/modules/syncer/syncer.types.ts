import { Queue } from '../../utils/index.js'


export interface Diffs {
  pathsToCreate: Queue<string>
  pathsToUpdate: Queue<string>
  pathsToDelete: Queue<string>
}
