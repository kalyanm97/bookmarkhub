import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_.]{3,20}$/i, { message: 'username must be 3–20 chars (letters, numbers, _ or .)' })
  username?: string;
}