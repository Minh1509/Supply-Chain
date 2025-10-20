import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ERROR_RESPONSE } from 'src/common/constants';
import { Role } from 'src/common/enums';
import { HashUtil } from 'src/common/utilities';
import { YearMonth } from 'src/common/utilities/year-month.util';
import { Employee, User } from 'src/entities';
import { Between, DataSource, Not, Repository } from 'typeorm';
import { Logger } from 'winston';
import { MonthlyUserReportResponseDto } from './dto/response/monthly-user-report-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserDto } from './dto/user.dto';
import { BaseService } from '../base.service';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private dataSource: DataSource,
  ) {
    super();
  }

  async create(body: UserDto): Promise<UserResponseDto> {
    if (body.role === Role.S_ADMIN) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_FORBIDDEN,
        message: 'Không có quyền tạo tài khoản S_ADMIN!',
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(User);
      const employeeRepo = queryRunner.manager.getRepository(Employee);

      if (body.employeeId) {
        const hasEmployee = await employeeRepo.findOne({
          where: { id: body.employeeId },
        });
        if (hasEmployee) {
          throw new RpcException({
            ...ERROR_RESPONSE.USER_ALREADY_EXISTS,
            message: 'Employee đã tồn tại',
          });
        }
      }

      const hasUser = await userRepo.findOne({
        where: [{ username: body.username }, { email: body.email }],
      });
      if (hasUser) {
        throw new RpcException({
          ...ERROR_RESPONSE.USER_ALREADY_EXISTS,
          message: 'Email hoặc username đã tồn tại',
        });
      }

      const user = userRepo.create({
        employeeId: body.employeeId,
        email: body.email,
        username: body.username,
        password: await HashUtil.hashData(body.password),
        role: body.role,
        status: body.status,
        verified: true,
      });

      await userRepo.save(user);

      await queryRunner.commitTransaction();

      return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error({ message: 'UserService.create error', error });
      throw new RpcException(ERROR_RESPONSE.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page = 1, pageSize = 10) {
    const queryBuilder = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.employee', 'employee');
    const { data, pagination } = await this.customPaginate<User>(
      queryBuilder,
      page,
      pageSize,
    );

    return {
      data: plainToInstance(UserResponseDto, instanceToPlain(data), {
        excludeExtraneousValues: true,
      }),
      pagination,
    };
  }

  async findAllByCompanyId(companyId: number, page = 1, pageSize = 10) {
    const queryBuilder = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.employee', 'e')
      .leftJoinAndSelect('e.department', 'd')
      .leftJoinAndSelect('d.company', 'c')
      .where('c.id = :companyId', { companyId });

    const { data, pagination } = await this.customPaginate(queryBuilder, page, pageSize);

    return {
      data: plainToInstance(UserResponseDto, instanceToPlain(data), {
        excludeExtraneousValues: true,
      }),
      pagination,
    };
  }

  async findByEmployeeId(employeeId: number): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({
      where: { employeeId },
      relations: ['employee'],
    });

    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    return plainToInstance(UserResponseDto, instanceToPlain(user), {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    return plainToInstance(UserResponseDto, instanceToPlain(user), {
      excludeExtraneousValues: true,
    });
  }

  async updateInfo(userId: number, data: UpdateInfoDto): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['employee'],
    });
    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    if (
      data.email &&
      (await this.userRepo.findOne({ where: { email: data.email, id: Not(userId) } }))
    )
      throw new RpcException({
        ...ERROR_RESPONSE.USER_ALREADY_EXISTS,
        message: 'Email đã được sử dụng!',
      });

    if (
      data.username &&
      (await this.userRepo.findOne({
        where: { username: data.username, id: Not(userId) },
      }))
    )
      throw new RpcException({
        ...ERROR_RESPONSE.USER_ALREADY_EXISTS,
        message: 'Username đã được sử dụng!',
      });

    Object.assign(user, data);
    const savedUser = await this.userRepo.save(user);

    return plainToInstance(UserResponseDto, instanceToPlain(savedUser), {
      excludeExtraneousValues: true,
    });
  }

  async updatePassword(userId: number, req: UpdatePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['employee'],
    });

    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    const valid = await HashUtil.verifyHashed(req.currentPassword, user.password);
    if (!valid) {
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'Mật khẩu hiện tại không đúng!',
      });
    }

    user.password = await HashUtil.hashData(req.newPassword);
    await this.userRepo.save(user);
    return { id: userId };
  }

  async getMonthlyReport(): Promise<MonthlyUserReportResponseDto[]> {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

    const users = await this.userRepo.find({
      where: { createdAt: Between(sixMonthsAgo, now) },
    });

    const monthlyMap = new Map<string, number>();

    users.forEach((user) => {
      const yearMonth = YearMonth.fromDate(user.createdAt);
      const key = yearMonth.toString();
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    });

    const result: MonthlyUserReportResponseDto[] = [];
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
