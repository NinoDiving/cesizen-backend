import { IsBoolean, IsString } from 'class-validator';

export class AdminUpdateUserDto {
  @IsBoolean()
  isSuspended: boolean;

  @IsString()
  roleId: string;
}
