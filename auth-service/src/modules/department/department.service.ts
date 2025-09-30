import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ERROR_RESPONSE } from 'src/common/constants';
import { Department } from 'src/entities';
import { Repository } from 'typeorm';
import { DepartmentResponseDto } from './dto/response/department-response.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department) private readonly departmentRepo: Repository<Department>,
  ) {}

  async findById(id: number): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepo.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!department) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
        message: 'Không tìm thấy bộ phận!',
      });
    }

    return plainToInstance(DepartmentResponseDto, department, {
      excludeExtraneousValues: true,
    });
  }

  async findByCompanyId(id: number): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepo.find({
      where: { companyId: id },
    });

    return plainToInstance(DepartmentResponseDto, departments, {
      excludeExtraneousValues: true,
    });
  }
}
