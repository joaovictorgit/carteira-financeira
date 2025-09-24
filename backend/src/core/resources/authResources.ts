import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail } from 'class-validator';

export class AuthResources {
  @ApiProperty()
  @IsNotEmpty({ message: 'E-mail é obrigatório!' })
  @IsEmail({}, { message: 'Formato do e-mail inválido!' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Senha é obrigatória!' })
  password: string;
};