import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AnnouncementAudience } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsBoolean()
  @IsOptional()
  pinned?: boolean;

  @IsEnum(AnnouncementAudience)
  @IsOptional()
  targetAudience?: AnnouncementAudience;

  @IsBoolean()
  @IsOptional()
  urgent?: boolean;
}
