import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[^<>'";&]+$/, { message: 'Team name contains invalid characters' })
  name: string;
}
