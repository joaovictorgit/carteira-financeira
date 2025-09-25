import { ApiProperty } from "@nestjs/swagger";
import { $Enums, Prisma } from "@prisma/client";
import { IsNotEmpty } from "class-validator";

export class CreateTransactionResource {
  @ApiProperty()
  @IsNotEmpty({ message: 'Valor da transação é obrigatório!' })
  amount: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Informe quem irá receber o valor!' })
  receiverId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Tipo da transação não informado!' })
  type?: $Enums.TypeTransaction;
}