import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ERROR_RESPONSE } from 'src/common/constants';
import { SuccessResponseDto } from 'src/common/dto';
import { Role } from 'src/common/enums';
import { EmployeeStatus } from 'src/common/enums/employee.enum';
import { UserStatus } from 'src/common/enums/user.enum';
import { HashUtil } from 'src/common/utilities';
import { Department, Employee, User } from 'src/entities';
import { DataSource, Repository } from 'typeorm';
import { Logger } from 'winston';
import { EmployeeDto } from './dto/employee.dto';
import { EmployeeResponseDto } from './dto/response/employee-response.dto';

@Injectable()
export class AdminEmployeeService {
  constructor(
    @InjectRepository(Employee) private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Department) private readonly departmentRepo: Repository<Department>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  async create(data: EmployeeDto): Promise<EmployeeResponseDto> {
    const [existingUser, existingEmployee, existingEmployeeCode, existingUsername] =
      await Promise.all([
        this.userRepo.findOne({ where: { email: data.email } }),
        this.employeeRepo.findOne({ where: { email: data.email } }),
        this.employeeRepo.findOne({ where: { employeeCode: data.employeeCode } }),
        this.userRepo.findOne({ where: { username: data.username } }),
      ]);

    if (existingUser || existingEmployee) {
      throw new RpcException({
        ...ERROR_RESPONSE.CONFLICT,
        message: 'Email đã được sử dụng!',
      });
    }
    if (existingEmployeeCode) {
      throw new RpcException({
        ...ERROR_RESPONSE.CONFLICT,
        message: 'Mã nhân viên đã được sử dụng!',
      });
    }
    if (existingUsername) {
      throw new RpcException({
        ...ERROR_RESPONSE.CONFLICT,
        message: 'Tên đăng nhập đã được sử dụng!',
      });
    }

    const department = await this.departmentRepo.findOne({
      where: { id: data.departmentId },
      relations: ['company'],
    });
    if (!department) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_NOT_FOUND,
        message: 'Không tìm thấy bộ phận!',
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = this.employeeRepo.create({
        ...data,
        status: EmployeeStatus.ACTIVE,
        departmentId: data.departmentId,
      });
      const savedEmployee = await queryRunner.manager.save(employee);

      const role = department.departmentName === 'Quản trị' ? Role.C_ADMIN : Role.USER;

      let username: string;
      username = data.username
        ? data.username
        : this.generateUsername(data.email, department.company.id);

      const user = this.userRepo.create({
        employeeId: savedEmployee.id,
        email: data.email,
        username,
        password: await HashUtil.hashData(data.password),
        role,
        status: UserStatus.ACTIVE,
        verified: true,
      });
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      return plainToInstance(
        EmployeeResponseDto,
        {
          ...savedEmployee,
          departmentName: department.departmentName,
        },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error({ message: 'AdminEmployeeService.create error', error });
      throw new RpcException(ERROR_RESPONSE.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteById(id: number): Promise<SuccessResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employeeRepo = queryRunner.manager.getRepository(Employee);
      const userRepo = queryRunner.manager.getRepository(User);

      const employee = await employeeRepo.findOne({ where: { id } });
      if (!employee) {
        return { success: false };
      }

      const user = await userRepo.findOne({ where: { employeeId: id } });
      if (!user) {
        return { success: false };
      }

      await Promise.all([
        userRepo.softDelete({ employeeId: id }),
        employeeRepo.softDelete(id),
      ]);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error({ message: 'AdminEmployeeService.deleteById error', error });
      throw new RpcException(ERROR_RESPONSE.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  private generateUsername(email: string, companyId: number): string {
    const prefix = email.split('@')[0];
    return `${prefix}${companyId}`;
  }
}
