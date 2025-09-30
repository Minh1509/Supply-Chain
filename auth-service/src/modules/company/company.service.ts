import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ERROR_RESPONSE } from 'src/common/constants';
import { Company } from 'src/entities';
import { Repository } from 'typeorm';
import { Logger } from 'winston';
import { ListCompanyResponseDto } from './dto/response/list-company-response.dto';
import { CompanyResponseDto } from '../admin/admin-company/dto/response/company-response.dto';
import { BaseService } from '../base.service';

@Injectable()
export class CompanyService extends BaseService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
  ) {
    super();
  }

  async findById(id: number): Promise<CompanyResponseDto> {
    const company = await this.companyRepo.findOne({ where: { id } });

    if (!company)
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'Công ty không tồn tại!',
      });

    return plainToInstance(CompanyResponseDto, company, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(page = 1, pageSize = 10): Promise<ListCompanyResponseDto> {
    const queryBuilder = this.companyRepo.createQueryBuilder('c');
    const { data, pagination } = await this.customPaginate<Company>(
      queryBuilder,
      page,
      pageSize,
    );

    return plainToInstance(
      ListCompanyResponseDto,
      {
        data: plainToInstance(CompanyResponseDto, data, {
          excludeExtraneousValues: true,
        }),
        pagination,
      },
      { excludeExtraneousValues: true },
    );
  }
}
