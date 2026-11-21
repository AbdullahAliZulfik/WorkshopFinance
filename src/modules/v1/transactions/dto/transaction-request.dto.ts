import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { TransactionType } from '../../../../database/enums/transaction-type.enum';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'Format tanggal harus YYYY-MM-DD';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul transaksi wajib diisi' })
  @MaxLength(150)
  title: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Nominal maksimal 2 angka desimal' })
  @Min(0.01, { message: 'Nominal harus lebih dari 0' })
  amount: number;

  @IsEnum(TransactionType, { message: 'type harus income atau expense' })
  type: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @Matches(DATE_REGEX, { message: DATE_MESSAGE })
  transactionDate: string;

  @Type(() => Number)
  @IsInt({ message: 'categoryId harus berupa angka' })
  categoryId: number;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export class FindAllTransactionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TransactionType, { message: 'type harus income atau expense' })
  type?: TransactionType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Matches(DATE_REGEX, { message: `startDate: ${DATE_MESSAGE}` })
  startDate?: string;

  @IsOptional()
  @Matches(DATE_REGEX, { message: `endDate: ${DATE_MESSAGE}` })
  endDate?: string;

  @IsOptional()
  @IsIn(['transactionDate', 'amount', 'title', 'createdAt'])
  sortBy?: 'transactionDate' | 'amount' | 'title' | 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class SummaryQueryDto {
  @IsOptional()
  @Matches(DATE_REGEX, { message: `startDate: ${DATE_MESSAGE}` })
  startDate?: string;

  @IsOptional()
  @Matches(DATE_REGEX, { message: `endDate: ${DATE_MESSAGE}` })
  endDate?: string;
}
