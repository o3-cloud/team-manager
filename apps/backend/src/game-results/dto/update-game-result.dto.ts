import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateGameResultDto {
  @IsInt()
  @Min(0)
  @Max(999)
  @IsOptional()
  ownScore?: number;

  @IsInt()
  @Min(0)
  @Max(999)
  @IsOptional()
  oppScore?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
