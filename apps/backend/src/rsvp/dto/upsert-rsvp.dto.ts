import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RsvpStatus } from '../entities/rsvp.entity';

export class UpsertRsvpDto {
  @IsEnum(RsvpStatus)
  status!: RsvpStatus;

  @IsUUID('4')
  @IsOptional()
  onBehalfOfUserId?: string;
}
