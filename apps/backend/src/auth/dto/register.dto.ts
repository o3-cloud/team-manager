import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'coach@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Coach Smith' })
  @IsString()
  @MinLength(1)
  displayName: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
