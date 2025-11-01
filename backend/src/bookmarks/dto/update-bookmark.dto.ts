import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateBookmarkDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
