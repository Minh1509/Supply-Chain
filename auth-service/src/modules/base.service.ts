import { APP_DEFAULTS } from 'src/common/constants';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';

export class BaseService {
  async customPaginate<T>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = APP_DEFAULTS.PAGINATION.PAGE_DEFAULT,
    pageSize: number = APP_DEFAULTS.PAGINATION.LIMIT_DEFAULT,
  ) {
    page = +page;
    pageSize = +pageSize;
    const start = (page - 1) * pageSize;
    const result = await queryBuilder.skip(start).take(pageSize).getManyAndCount();
    const items = result[0];
    const totalItems = result[1];
    const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;

    return {
      data: items,
      pagination: {
        total: totalItems,
        pageSize,
        totalPages,
        page,
      },
    };
  }

  async customPaginateGetRawMany<T>(
    repository: Repository<T>,
    queryBuilder: SelectQueryBuilder<T>,
    page: number = APP_DEFAULTS.PAGINATION.PAGE_DEFAULT,
    pageSize: number = APP_DEFAULTS.PAGINATION.LIMIT_DEFAULT,
  ) {
    page = +page;
    pageSize = +pageSize;
    const start = (page - 1) * pageSize;
    const [subQuery, subQueryParams] = queryBuilder.getQueryAndParameters();
    const countQuery = `
      WITH subquery AS (
        ${subQuery}
      )
      SELECT
        COUNT(*) AS cnt
      FROM
        subquery
    `;

    const count = await repository.query(countQuery, subQueryParams);
    const result = await queryBuilder.offset(start).limit(pageSize).getRawMany();
    const items = result;
    const totalItems = Number(count[0].cnt);
    const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;

    return {
      data: items,
      count: totalItems,
      pagination: {
        total: totalItems,
        pageSize,
        totalPages,
        page,
      },
    };
  }

  protected responseSuccess(): SuccessResponseDto {
    return { success: true };
  }
}
