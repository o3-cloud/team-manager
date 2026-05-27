import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateRosterEntryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  jerseyNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  position?: string;
}
