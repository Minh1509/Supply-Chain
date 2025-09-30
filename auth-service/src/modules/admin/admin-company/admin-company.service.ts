import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ERROR_RESPONSE } from 'src/common/constants';
import { YearMonth } from 'src/common/utilities/year-month.util';
import { Company } from 'src/entities';
import { BaseService } from 'src/modules/base.service';
import { AwsS3Service } from 'src/modules/shared/aws-s3';
import { Between, Not, Repository } from 'typeorm';
import { Logger } from 'winston';
import { CompanyDto } from './dto/company.dto';
import { CompanyResponseDto } from './dto/response/company-response.dto';
import { MonthlyCompanyReportResponseDto } from './dto/response/monthly-report-response.dto';

@Injectable()
export class AdminCompanyService extends BaseService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    private awsS3Service: AwsS3Service,
  ) {
    super();
  }

  async update(body: CompanyDto, id: number): Promise<CompanyResponseDto> {
    const company = await this.companyRepo.findOneBy({ id });
    if (!company)
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
        message: 'Công ty không tồn tại!',
      });

    if (body.companyCode) {
      const isCodeExists = await this.companyRepo.exists({
        where: { companyCode: body.companyCode, id: Not(id) },
      });
      if (isCodeExists) {
        throw new RpcException({
          ...ERROR_RESPONSE.CONFLICT,
          message: `Mã công ty '${body.companyCode}' đã tồn tại!`,
        });
      }
    }

    if (body.taxCode) {
      const isTaxExists = await this.companyRepo.exists({
        where: { taxCode: body.taxCode, id: Not(id) },
      });
      if (isTaxExists) {
        throw new RpcException({
          ...ERROR_RESPONSE.CONFLICT,
          message: `Mã số thuế '${body.taxCode}' đã tồn tại!`,
        });
      }
    }

    Object.assign(company, body);
    const savedCompany = await this.companyRepo.save(company);

    return plainToInstance(CompanyResponseDto, savedCompany, {
      excludeExtraneousValues: true,
    });
  }

  async updateLogo(id: number, file: Express.Multer.File) {
    const company = await this.companyRepo.findOneBy({ id });
    if (!company)
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
        message: 'Công ty không tồn tại!',
      });
    if (!file)
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'Logo không hợp lệ',
      });

    const logoUrl = await this.awsS3Service.uploadFile(file, 'company-logos');
    company.logoUrl = logoUrl;
    await this.companyRepo.save(company);

    return logoUrl;
  }

  async getMonthlyCompanyReport(): Promise<MonthlyCompanyReportResponseDto[]> {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

    const companies = await this.companyRepo.find({
      where: { joinDate: Between(sixMonthsAgo, now) },
    });

    const monthlyMap = new Map<string, number>();

    companies.forEach((company) => {
      if (company.joinDate) {
        const yearMonth = YearMonth.fromDate(company.joinDate);
        const key = yearMonth.toString();
        monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
      }
    });

    const result: MonthlyCompanyReportResponseDto[] = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const yearMonth = YearMonth.fromDate(date);
      const monthKey = yearMonth.toString();

      result.push({
        month: monthKey,
        totalQuantity: monthlyMap.get(monthKey) || 0,
      });
    }

    return result;
  }
}
