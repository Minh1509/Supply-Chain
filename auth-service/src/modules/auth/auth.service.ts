import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ERROR_RESPONSE } from 'src/common/constants';
import { SuccessResponseDto } from 'src/common/dto';
import { JwtTokenType, Role } from 'src/common/enums';
import { CompanyStatus } from 'src/common/enums/company.enum';
import { EmployeeStatus } from 'src/common/enums/employee.enum';
import { UserStatus } from 'src/common/enums/user.enum';
import { HashUtil, TimeUtil } from 'src/common/utilities';
import { codeExpiresConfiguration, jwtConfiguration } from 'src/config';
import { Company, Department, Employee, User } from 'src/entities';
import { DataSource, Like, Repository } from 'typeorm';
import { Logger } from 'winston';
import { AuthPublisherService } from './auth-publisher.service';
import { JwtPayload, UserRequestPayload } from './auth.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { BaseService } from '../base.service';
import { RedisService } from '../shared/redis/redis.service';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfiguration.KEY)
    private readonly jwtConfig: ConfigType<typeof jwtConfiguration>,
    @Inject(codeExpiresConfiguration.KEY)
    private readonly codeExpiresConfig: ConfigType<typeof codeExpiresConfiguration>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private dataSource: DataSource,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly authPublisherService: AuthPublisherService,
  ) {
    super();
  }

  async registerCompany(dto: RegisterCompanyDto): Promise<SuccessResponseDto> {
    // Check email
    const existedUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existedUser && existedUser.verified) {
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: `Email đã được sử dụng`,
      });
    }

    // Check company
    const existedCompany = await this.companyRepo.findOne({
      where: { taxCode: dto.taxCode },
    });
    if (existedCompany) {
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'Công ty đã được đăng ký!',
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const companyRepo = queryRunner.manager.getRepository(Company);
      const departmentRepo = queryRunner.manager.getRepository(Department);
      const employeeRepo = queryRunner.manager.getRepository(Employee);
      const userRepo = queryRunner.manager.getRepository(User);

      // Tạo company
      const company = companyRepo.create({
        companyName: dto.companyName,
        companyCode: await this.generateCompanyCode(companyRepo),
        taxCode: dto.taxCode,
        address: dto.address,
        companyType: dto.companyType,
        mainIndustry: dto.mainIndustry ?? null,
        representativeName: dto.representativeName,
        startDate: dto.startDate ?? new Date(),
        joinDate: new Date(),
        phoneNumber: dto.phoneNumber ?? null,
        email: dto.email,
        status: CompanyStatus.ACTIVE,
      });
      const savedCompany = await companyRepo.save(company);

      // Tạo department mặc định
      // const departmentNames = ['Quản trị', 'Kho', 'Vận chuyển', 'Mua hàng', 'Bán hàng'];
      // if (dto.companyType?.toLowerCase() === 'doanh nghiệp sản xuất') {
      //   departmentNames.push('Sản xuất');
      // }
      // Tạo department mặc định
      const departmentNames = ['Quản trị', 'Mua, Bán hàng'];
      if (dto.companyType?.toLowerCase() === 'doanh nghiệp thương mại') {
        departmentNames.push('Kho, Vận chuyển');
      }

      if (dto.companyType?.toLowerCase() === 'doanh nghiệp sản xuất') {
        departmentNames.push('Kho, Sản xuất, Vận chuyển');
      }

      const departments: Department[] = [];
      for (const depName of departmentNames) {
        const dep = departmentRepo.create({
          companyId: savedCompany.id,
          departmentCode: await this.generateDepartmentCode(
            savedCompany.id,
            departmentRepo,
          ),
          departmentName: depName,
        });
        departments.push(await departmentRepo.save(dep));
      }

      // Lấy phòng Quản trị
      const managementDepartment = departments.find(
        (d) => d.departmentName === 'Quản trị',
      );
      if (!managementDepartment) {
        throw new RpcException({
          ...ERROR_RESPONSE.BAD_REQUEST,
          message: 'Không có bộ phận Quản trị!',
        });
      }

      // Tạo employee
      const employee = employeeRepo.create({
        departmentId: managementDepartment.id,
        employeeCode: dto.employeeCode ?? null,
        employeeName: dto.representativeName,
        position: dto.position ?? 'Quản lý',
        email: dto.email,
        status: EmployeeStatus.ACTIVE,
        address: dto.address ?? null,
        phoneNumber: dto.phoneNumber ?? null,
        startDate: dto.startDate ?? null,
      });
      const savedEmployee = await employeeRepo.save(employee);

      // Tạo user
      const user = userRepo.create({
        employeeId: savedEmployee.id,
        email: dto.email,
        username: this.generateUsername(dto.email, savedCompany.id),
        password: await HashUtil.hashData(dto.password),
        role: Role.C_ADMIN,
        status: UserStatus.PENDING,
        verified: false,
      });
      const savedUser = await userRepo.save(user);

      await queryRunner.commitTransaction();

      // Gửi mail sau khi commit
      await this.generateOtpAndSendMail(savedUser);

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error({ message: 'AuthService.registerCompany error', error });
      throw new RpcException(ERROR_RESPONSE.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['employee'],
    });

    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    if (!user.verified) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_FORBIDDEN,
        message: 'Tài khoản chưa được xác thực!',
      });
    }

    if (user.status === UserStatus.BANNED) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_FORBIDDEN,
        message: 'Tài khoản đã bị khóa!',
      });
    }

    const isPasswordValid = await HashUtil.verifyHashed(dto.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        ...ERROR_RESPONSE.UNAUTHORIZED,
        message: 'Mật khẩu không chính xác!',
      });
    }

    const { accessToken, refreshToken } = await this.manageUserToken(user);

    return plainToInstance(
      LoginResponseDto,
      {
        ...user,
        accessToken,
        refreshToken,
        employeeCode: user.employee?.employeeCode,
        userId: user.id,
      },
      { excludeExtraneousValues: true },
    );
  }

  async logout(userId: number, jti: string): Promise<SuccessResponseDto> {
    const hasUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!hasUser) throw new RpcException(ERROR_RESPONSE.USER_NOT_FOUND);

    const userTokenKey = this.redisService.getUserTokenKey(userId, jti);
    const exists = await this.redisService.getValue(userTokenKey);
    if (!exists)
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'Token not found',
      });

    await this.redisService.deleteKey(userTokenKey);

    return { success: true };
  }

  async refreshToken(body: RefreshTokenDto) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(body.refreshToken);
    } catch (error) {
      throw new RpcException({
        ...ERROR_RESPONSE.UNAUTHORIZED,
        message: 'token is invalid or expire',
      });
    }

    const { sub: userId, jti } = payload;
    const userTokenKey = this.redisService.getUserTokenKey(userId, jti);
    const exists = await this.redisService.getValue(userTokenKey);
    if (!exists)
      throw new RpcException({
        ...ERROR_RESPONSE.UNAUTHORIZED,
        message: 'token not found',
      });
    const { iat, exp, ...restPayload } = payload;

    const accessToken = await this.generateToken(
      restPayload,
      JwtTokenType.AccessToken,
      this.jwtConfig.accessTokenExpiresIn,
    );
    return { accessToken };
  }

  async verifyOtp(body: VerifyOTPDto): Promise<SuccessResponseDto> {
    const user = await this.userRepo.findOne({ where: { email: body.email } });
    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    const savedOtp = await this.redisService.getValue<number>(
      this.redisService.getVerifyOTPKey(user.id),
    );

    if (!savedOtp || savedOtp !== body.otp) {
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'OTP không hợp lệ hoặc đã hết hạn!',
      });
    }

    user.verified = true;
    user.status = UserStatus.ACTIVE;
    await this.userRepo.save(user);

    await this.redisService.deleteKey(this.redisService.getVerifyOTPKey(user.id));

    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<SuccessResponseDto> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    await this.generateOtpAndSendMail(user);

    return {
      success: true,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<SuccessResponseDto> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    user.password = await HashUtil.hashData(dto.newPassword);
    await this.userRepo.save(user);

    await this.redisService.deleteByPattern(`user:${user.id}:token:*`);

    return {
      success: true,
    };
  }

  async sysadminLogin(dto: LoginDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user)
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });

    const isPasswordValid = await HashUtil.verifyHashed(dto.password, user.password);
    if (!isPasswordValid)
      throw new RpcException({
        ...ERROR_RESPONSE.UNAUTHORIZED,
        message: 'Mật khẩu không chính xác!',
      });

    await this.generateOtpAndSendMail(user);

    return { message: 'Mã OTP đã được gửi đến email!' };
  }

  async sysadminVerifyOtp(dto: VerifyOTPDto): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new RpcException({
        ...ERROR_RESPONSE.USER_NOT_FOUND,
        message: 'Không tìm thấy tài khoản!',
      });
    }

    const savedOtp = await this.redisService.getValue<number>(
      this.redisService.getVerifyOTPKey(user.id),
    );

    if (!savedOtp || savedOtp !== dto.otp) {
      throw new RpcException({
        ...ERROR_RESPONSE.BAD_REQUEST,
        message: 'OTP không hợp lệ hoặc đã hết hạn!',
      });
    }

    user.verified = true;
    user.status = UserStatus.ACTIVE;
    await this.redisService.deleteKey(this.redisService.getVerifyOTPKey(user.id));

    const { accessToken, refreshToken } = await this.manageUserToken(user);

    return plainToInstance(
      LoginResponseDto,
      {
        accessToken,
        refreshToken,
        ...user,
        userId: user.id,
        employeeCode: user.employee?.employeeCode,
      },
      { excludeExtraneousValues: true },
    );
  }

  async verifyToken(token: string) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new RpcException(ERROR_RESPONSE.UNAUTHORIZED);
    }

    const { sub, jti, email, username, roles, typeToken } = payload;

    if (typeToken !== JwtTokenType.AccessToken) {
      throw new RpcException(ERROR_RESPONSE.INVALID_TOKEN_USAGE);
    }

    const userTokenKey = this.redisService.getUserTokenKey(sub, jti);
    const isTokenValid = await this.redisService.getValue<string>(userTokenKey);
    if (!isTokenValid) {
      throw new RpcException(ERROR_RESPONSE.UNAUTHORIZED);
    }

    const user = await this.userRepo.findOne({ where: { id: sub } });
    if (!user) {
      throw new RpcException(ERROR_RESPONSE.USER_NOT_FOUND);
    }
    if (!user.verified) {
      throw new RpcException({
        ...ERROR_RESPONSE.RESOURCE_FORBIDDEN,
        message: 'User is not verified',
      });
    }

    return {
      sub,
      jti,
      email,
      username,
      roles,
      typeToken,
    };
  }

  private async manageUserToken(user: User) {
    const jti = randomUUID();
    const tokenPayload: JwtPayload = {
      sub: user.id,
      jti,
      email: user.email,
      username: user.username,
      roles: [user.role as Role],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(
        tokenPayload,
        JwtTokenType.AccessToken,
        this.jwtConfig.accessTokenExpiresIn,
      ),
      this.generateToken(
        tokenPayload,
        JwtTokenType.RefreshToken,
        this.jwtConfig.refreshTokenExpiresIn,
      ),
    ]);

    await this.redisService.setValue<string>(
      this.redisService.getUserTokenKey(user.id, jti),
      'deviceId',
      TimeUtil.getTtlValue(this.jwtConfig.refreshTokenExpiresIn),
    );

    return { accessToken, refreshToken };
  }

  private async generateToken(
    payload: JwtPayload,
    type: JwtTokenType,
    expiresIn: number | string,
  ) {
    const tokenPayload: UserRequestPayload = {
      ...payload,
      typeToken: type,
    };

    return this.jwtService.signAsync(tokenPayload, { expiresIn });
  }

  private async generateCompanyCode(repo?: Repository<Company>): Promise<string> {
    const companyRepo = repo ?? this.companyRepo;
    const prefix = 'C';

    while (true) {
      const count = await companyRepo.count({
        where: { companyCode: Like(`${prefix}%`) },
      });
      const code = prefix + (count + 1).toString().padStart(4, '0');

      const existing = await companyRepo.findOne({ where: { companyCode: code } });
      if (!existing) return code;
    }
  }

  private async generateDepartmentCode(
    companyId: number,
    repo?: Repository<Department>,
  ): Promise<string> {
    const departmentRepo = repo ?? this.departmentRepo;
    const prefix = `D${companyId}`;
    let code: string;

    while (true) {
      const count = await departmentRepo.count({
        where: { departmentCode: Like(`${prefix}%`) },
      });
      code = prefix + (count + 1).toString().padStart(2, '0');

      const existing = await departmentRepo.findOne({
        where: { departmentCode: code },
      });

      if (!existing) return code;
    }
  }

  private generateUsername(email: string, companyId: number): string {
    const prefix = email.split('@')[0];
    return `${prefix}${companyId}`;
  }

  private async generateOtpAndSendMail(user: User): Promise<number> {
    // const otp = Math.floor(100000 + Math.random() * 900000);
    const otp = 123456;

    await this.redisService.setValue<number>(
      this.redisService.getVerifyOTPKey(user.id),
      otp,
      TimeUtil.getTtlValue(this.codeExpiresConfig.verifyOTP),
    );

    // TODO: send email
    this.authPublisherService.sendVerifyOtp(
      user.email,
      otp,
      this.codeExpiresConfig.verifyOTP,
    );

    return otp;
  }
}
