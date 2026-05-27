import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CancelEventDto {
  @IsInt()
  @Min(0)
  version!: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
