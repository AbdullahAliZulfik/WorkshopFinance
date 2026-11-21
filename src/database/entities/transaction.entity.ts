import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionType } from '../enums/transaction-type.enum';
import { Category } from './category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  // DECIMAL dari MySQL dikembalikan sebagai string, jadi diubah ke number.
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? null : parseFloat(value)),
    },
  })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Format 'YYYY-MM-DD'
  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: string;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.transactions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'FK_transactions_category_id',
  })
  category: Relation<Category>;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
