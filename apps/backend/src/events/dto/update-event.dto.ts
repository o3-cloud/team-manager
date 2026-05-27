import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EventType } from '../entities/event.entity';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @Min(0)
  version!: number;
}
