import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ok } from '../../../utils/response.util';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  FindAllCategoriesQueryDto,
  UpdateCategoryDto,
} from './dto/category-request.dto';

@Controller('v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query() query: FindAllCategoriesQueryDto) {
    const data = await this.categoriesService.findAll(query);
    return ok('Kategori berhasil diambil', data);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoriesService.findById(id);
    return ok('Detail kategori berhasil diambil', data);
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(dto);
    return ok('Kategori berhasil dibuat', data, undefined, 201);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(id, dto);
    return ok('Kategori berhasil diperbarui', data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoriesService.remove(id);
    return ok('Kategori berhasil dihapus', data);
  }
}
