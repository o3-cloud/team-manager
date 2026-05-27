import { IsDateString, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { EventType } from '../../events/entities/event.entity';

export class CreateRecurringEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsEnum(EventType)
  type!: EventType;

  @IsString()
  rruleString!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsDateString()
  firstStartsAt!: string;
}
