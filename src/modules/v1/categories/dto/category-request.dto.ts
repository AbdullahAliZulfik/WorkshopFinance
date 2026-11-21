import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TransactionType } from '../../../../database/enums/transaction-type.enum';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @MaxLength(100)
  name: string;

  @IsEnum(TransactionType, { message: 'type harus income atau expense' })
  type: TransactionType;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class FindAllCategoriesQueryDto {
  @IsOptional()
  @IsEnum(TransactionType, { message: 'type harus income atau expense' })
  type?: TransactionType;
}
