import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ERROR_RESPONSE } from 'src/common/constants';
import { Employee } from 'src/entities';
import { AwsS3Service } from 'src/modules/shared/aws-s3';
import { Repository } from 'typeorm';
import { EmployeeUserDto } from './dto/employee-user.dto';
import { EmployeeUserResponseDto } from './dto/response/employee-user-response.dto';
import { EmployeeResponseDto } from '../admin/admin-employee/dto/response/employee-response.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) private readonly employeeRepo: Repository<Employee>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async findByCompanyId(id: number): Promise<EmployeeUserResponseDto[]> {
    const employees = await this.employeeRepo.find({
      where: { department: { companyId: id } },
      relations: ['department'],
    });

    return plainToInstance(
      EmployeeResponseDto,
      employees.map(employee => ({ ...employee, departmentName: employee.department?.departmentName })),
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async findById(id: number): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['department'],
    });

    if (!employee) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
        message: 'Không tìm thấy nhân viên!',
      });
    }

    return plainToInstance(
      EmployeeResponseDto,
      {
        ...employee,
        departmentName: employee.department?.departmentName,
      },
      { excludeExtraneousValues: true },
    );
  }

  async update(id: number, data: EmployeeUserDto): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['department'],
    });

    if (!employee) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
        message: 'Không tìm thấy nhân viên!',
      });
    }

    Object.assign(employee, data);

    const savedEmployee = await this.employeeRepo.save(employee);

    return plainToInstance(
      EmployeeResponseDto,
      {
        ...savedEmployee,
        departmentName: savedEmployee.department?.departmentName,
      },
      { excludeExtraneousValues: true },
    );
  }

  async updateAvatar(id: number, file: any) {
    const employee = await this.employeeRepo.findOne({ where: { id } });

    if (!employee) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
        message: 'Không tìm thấy nhân viên!',
      });
    }

    if (!file) {
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'File ảnh không hợp lệ!',
      });
    }

    if (file.buffer && file.buffer?.type === 'Buffer') {
      file.buffer = Buffer.from(file.buffer?.data);
    }

    const avatarUrl = await this.awsS3Service.uploadFile(file, 'employee-avatars');
    employee.avatar = avatarUrl;
    await this.employeeRepo.save(employee);

    return { url: avatarUrl };
  }
}
