import { IsString, IsUrl, IsOptional, IsInt, Min } from 'class-validator';

export class CreateMonitorDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  intervalSeconds?: number;
}