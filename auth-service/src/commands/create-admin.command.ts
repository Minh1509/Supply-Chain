import { InjectRepository } from '@nestjs/typeorm';
import chalk from 'chalk';
import { Command, CommandRunner, InquirerService, Option } from 'nest-commander';
import { Role } from 'src/common/enums';
import { HashUtil } from 'src/common/utilities';
import { User } from 'src/entities';
import { DataSource, Repository } from 'typeorm';
import { commandConstants, questionConstants } from './command.constant';

@Command({
  name: commandConstants.createAdmin,
  description: 'Create a system admin',
  arguments: '[username] [password] [email]',
})
export class CreateAdminCommand extends CommandRunner {
  constructor(
    private readonly inquirer: InquirerService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async run(): Promise<void> {
    const answers = await this.inquirer.prompt<{
      username: string;
      password: string;
      email: string;
    }>(questionConstants.createAdmin, undefined);
    const username = answers.username.trim();
    const password = answers.password.trim();
    const email = answers.email.trim();

    const hasAccount = await this.userRepo.findOneBy({ username });
    if (hasAccount) {
      console.log(chalk.red('CreateAdminCommandError: Username already exits'));
      return;
    }

    const passwordHash = await HashUtil.hashData(password);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.save(User, {
        username,
        password: passwordHash,
        email,
        role: Role.S_ADMIN,
      });

      await queryRunner.commitTransaction();
      console.log(chalk.green('Create admin successfully.'));
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(chalk.red('CreateAdminCommand Error: '), err);
    } finally {
      await queryRunner.release();
    }
  }

  @Option({
    flags: '-s, --shell <shell>',
  })
  parseShell(val: string) {
    return val;
  }
}
