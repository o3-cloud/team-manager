import { IsUUID } from 'class-validator';

export class LinkParentDto {
  @IsUUID()
  parentUserId: string;
}
