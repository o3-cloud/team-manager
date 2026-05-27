import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { EventType } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsEnum(EventType)
  type!: EventType;

  @IsDateString()
  startsAt!: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
