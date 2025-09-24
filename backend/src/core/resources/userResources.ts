import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserResource {
  @ApiProperty()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'E-mail é obrigatório!' })
  @IsEmail({}, { message: 'Formato do e-mail inválido!' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Senha é obrigatória!' })
  password: string;
}

export class UpdateUserResource {
  @ApiProperty()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'E-mail é obrigatório!' })
  @IsEmail({}, { message: 'Formato do e-mail inválido!' })
  email: string;
}

export class UpdateUserPasswordResource {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}