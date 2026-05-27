import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateRosterEntryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  jerseyNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  position?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
