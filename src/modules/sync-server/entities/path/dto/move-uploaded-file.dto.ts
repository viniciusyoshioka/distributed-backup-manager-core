import { IsString } from 'class-validator'


export class MoveUploadedFileDTO {
  @IsString()
  uploadedFilePath!: string

  @IsString()
  destinationPath!: string
}
