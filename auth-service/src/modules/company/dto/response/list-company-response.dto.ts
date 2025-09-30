import { Exclude, Expose, Type } from 'class-transformer';
import { PaginationResponseDto } from 'src/common/dto';
import { CompanyResponseDto } from 'src/modules/admin/admin-company/dto/response/company-response.dto';

@Exclude()
export class ListCompanyResponseDto extends PaginationResponseDto<CompanyResponseDto> {
  @Expose()
  @Type(() => CompanyResponseDto)
  declare data: CompanyResponseDto[];
}
