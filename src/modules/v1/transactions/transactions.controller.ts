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
import {
  CreateTransactionDto,
  FindAllTransactionsQueryDto,
  SummaryQueryDto,
  UpdateTransactionDto,
} from './dto/transaction-request.dto';
import { TransactionsService } from './transactions.service';

@Controller('v1/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(@Query() query: FindAllTransactionsQueryDto) {
    const { items, meta } = await this.transactionsService.findAll(query);
    return ok('Transaksi berhasil diambil', items, meta);
  }

  // Harus di atas ':id' supaya "summary" tidak dianggap sebagai id
  @Get('summary')
  async getSummary(@Query() query: SummaryQueryDto) {
    const data = await this.transactionsService.getSummary(query);
    return ok('Ringkasan keuangan berhasil diambil', data);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.transactionsService.findById(id);
    return ok('Detail transaksi berhasil diambil', data);
  }

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const data = await this.transactionsService.create(dto);
    return ok('Transaksi berhasil dibuat', data, undefined, 201);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransactionDto) {
    const data = await this.transactionsService.update(id, dto);
    return ok('Transaksi berhasil diperbarui', data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.transactionsService.remove(id);
    return ok('Transaksi berhasil dihapus', data);
  }
}
