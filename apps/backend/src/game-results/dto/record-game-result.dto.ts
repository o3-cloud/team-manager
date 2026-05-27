import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class RecordGameResultDto {
  @IsUUID('4')
  seasonId!: string;

  @IsInt()
  @Min(0)
  @Max(999)
  ownScore!: number;

  @IsInt()
  @Min(0)
  @Max(999)
  oppScore!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
