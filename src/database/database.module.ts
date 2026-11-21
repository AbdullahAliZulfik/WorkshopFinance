import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { Category } from './entities/category.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Category, Transaction]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
