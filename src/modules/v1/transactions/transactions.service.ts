import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../../database/entities/category.entity';
import { Transaction } from '../../../database/entities/transaction.entity';
import { TransactionType } from '../../../database/enums/transaction-type.enum';
import {
  createPaginationMeta,
  normalizePaginationQuery,
} from '../../../utils/pagination.util';
import {
  CreateTransactionDto,
  FindAllTransactionsQueryDto,
  SummaryQueryDto,
  UpdateTransactionDto,
} from './dto/transaction-request.dto';

const SORT_COLUMNS = {
  transactionDate: 't.transactionDate',
  amount: 't.amount',
  title: 't.title',
  createdAt: 't.createdAt',
} as const;

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(query: FindAllTransactionsQueryDto) {
    const { page, limit, skip } = normalizePaginationQuery(query.page, query.limit);

    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'c');

    if (query.search?.trim()) {
      qb.andWhere('(t.title LIKE :search OR t.description LIKE :search)', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.type) qb.andWhere('t.type = :type', { type: query.type });
    if (query.categoryId) qb.andWhere('t.categoryId = :categoryId', { categoryId: query.categoryId });
    if (query.startDate) qb.andWhere('t.transactionDate >= :startDate', { startDate: query.startDate });
    if (query.endDate) qb.andWhere('t.transactionDate <= :endDate', { endDate: query.endDate });

    const sortColumn = SORT_COLUMNS[query.sortBy ?? 'transactionDate'];
    qb.orderBy(sortColumn, query.sortOrder ?? 'DESC').addOrderBy('t.id', 'DESC');

    const [items, totalItems] = await qb.skip(skip).take(limit).getManyAndCount();

    return { items, meta: createPaginationMeta(page, limit, totalItems) };
  }

  async findById(id: number) {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!transaction) throw new NotFoundException(`Transaksi dengan id ${id} tidak ditemukan`);
    return transaction;
  }

  async create(dto: CreateTransactionDto) {
    await this.assertCategoryMatchesType(dto.categoryId, dto.type);

    const transaction = this.transactionRepo.create({
      title: dto.title.trim(),
      amount: dto.amount,
      type: dto.type,
      description: dto.description?.trim() || null,
      transactionDate: dto.transactionDate,
      categoryId: dto.categoryId,
    });
    const saved = await this.transactionRepo.save(transaction);
    return this.findById(saved.id);
  }

  async update(id: number, dto: UpdateTransactionDto) {
    const transaction = await this.findById(id);

    const nextType = dto.type ?? transaction.type;
    const nextCategoryId = dto.categoryId ?? transaction.categoryId;

    if (nextType !== transaction.type || nextCategoryId !== transaction.categoryId) {
      await this.assertCategoryMatchesType(nextCategoryId, nextType);
    }

    transaction.title = dto.title?.trim() ?? transaction.title;
    transaction.amount = dto.amount ?? transaction.amount;
    transaction.type = nextType;
    transaction.transactionDate = dto.transactionDate ?? transaction.transactionDate;
    transaction.categoryId = nextCategoryId;
    if (dto.description !== undefined) {
      transaction.description = dto.description.trim() || null;
    }
    // Hindari relasi lama menimpa categoryId yang baru
    transaction.category = undefined as unknown as Category;

    await this.transactionRepo.save(transaction);
    return this.findById(id);
  }

  async remove(id: number) {
    const transaction = await this.findById(id);
    await this.transactionRepo.remove(transaction);
    return { id, deleted: true };
  }

  async getSummary(query: SummaryQueryDto) {
    const totalsQb = this.transactionRepo
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
      .addSelect('COUNT(t.id)', 'count')
      .groupBy('t.type');

    const categoryQb = this.transactionRepo
      .createQueryBuilder('t')
      .innerJoin('t.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.name', 'name')
      .addSelect('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('t.type')
      .orderBy('total', 'DESC');

    for (const qb of [totalsQb, categoryQb]) {
      if (query.startDate) qb.andWhere('t.transactionDate >= :startDate', { startDate: query.startDate });
      if (query.endDate) qb.andWhere('t.transactionDate <= :endDate', { endDate: query.endDate });
    }

    const [totalRows, categoryRows] = await Promise.all([
      totalsQb.getRawMany<{ type: TransactionType; total: string; count: string }>(),
      categoryQb.getRawMany<{
        categoryId: number;
        name: string;
        type: TransactionType;
        total: string;
      }>(),
    ]);

    const totalFor = (type: TransactionType) =>
      parseFloat(totalRows.find((r) => r.type === type)?.total ?? '0');
    const countFor = (type: TransactionType) =>
      parseInt(totalRows.find((r) => r.type === type)?.count ?? '0', 10);

    const totalIncome = totalFor(TransactionType.INCOME);
    const totalExpense = totalFor(TransactionType.EXPENSE);

    return {
      totalIncome,
      totalExpense,
      balance: Math.round((totalIncome - totalExpense) * 100) / 100,
      incomeCount: countFor(TransactionType.INCOME),
      expenseCount: countFor(TransactionType.EXPENSE),
      byCategory: categoryRows.map((r) => ({
        categoryId: Number(r.categoryId),
        name: r.name,
        type: r.type,
        total: parseFloat(r.total),
      })),
    };
  }

  private async assertCategoryMatchesType(categoryId: number, type: TransactionType) {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new BadRequestException(`Kategori dengan id ${categoryId} tidak ditemukan`);
    }
    if (category.type !== type) {
      throw new BadRequestException(
        `Kategori "${category.name}" adalah kategori ${category.type}, tidak cocok dengan transaksi ${type}`,
      );
    }
  }
}
