import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../../database/entities/category.entity';
import { Transaction } from '../../../database/entities/transaction.entity';
import {
  CreateCategoryDto,
  FindAllCategoriesQueryDto,
  UpdateCategoryDto,
} from './dto/category-request.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  findAll(query: FindAllCategoriesQueryDto) {
    return this.categoryRepo.find({
      where: query.type ? { type: query.type } : {},
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Kategori dengan id ${id} tidak ditemukan`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    await this.assertNameAvailable(dto.name, dto.type);
    const category = this.categoryRepo.create({ name: dto.name.trim(), type: dto.type });
    return this.categoryRepo.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findById(id);

    const nextName = dto.name?.trim() ?? category.name;
    const nextType = dto.type ?? category.type;

    if (nextType !== category.type) {
      const used = await this.transactionRepo.count({ where: { categoryId: id } });
      if (used > 0) {
        throw new ConflictException(
          `Jenis kategori tidak bisa diubah karena sudah dipakai ${used} transaksi`,
        );
      }
    }

    if (nextName !== category.name || nextType !== category.type) {
      await this.assertNameAvailable(nextName, nextType, id);
    }

    category.name = nextName;
    category.type = nextType;
    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findById(id);

    const used = await this.transactionRepo.count({ where: { categoryId: id } });
    if (used > 0) {
      throw new ConflictException(
        `Kategori tidak bisa dihapus karena masih dipakai ${used} transaksi`,
      );
    }

    await this.categoryRepo.remove(category);
    return { id, deleted: true };
  }

  private async assertNameAvailable(name: string, type: string, exceptId?: number) {
    const existing = await this.categoryRepo
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:name)', { name: name.trim() })
      .andWhere('c.type = :type', { type })
      .getOne();

    if (existing && existing.id !== exceptId) {
      throw new ConflictException('Kategori dengan nama dan jenis yang sama sudah ada');
    }
  }
}
