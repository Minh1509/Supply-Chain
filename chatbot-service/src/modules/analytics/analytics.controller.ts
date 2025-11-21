import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('popular-intents')
  @ApiOperation({ summary: 'Get popular intents' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getPopularIntents(@Query('days') days = 7) {
    return this.analyticsService.getPopularIntents(Number(days));
  }

  @Get('response-time')
  @ApiOperation({ summary: 'Get average response time' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getAverageResponseTime(@Query('days') days = 7) {
    const avgTime = await this.analyticsService.getAverageResponseTime(Number(days));
    return {
      averageResponseTime: avgTime,
      unit: 'ms',
      period: `${days} days`,
    };
  }

  @Get('success-rate')
  @ApiOperation({ summary: 'Get success rate' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getSuccessRate(@Query('days') days = 7) {
    const rate = await this.analyticsService.getSuccessRate(Number(days));
    return {
      successRate: rate,
      unit: '%',
      period: `${days} days`,
    };
  }

  @Get('user-activity')
  @ApiOperation({ summary: 'Get user activity' })
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getUserActivity(@Query('userId') userId: string, @Query('days') days = 30) {
    return this.analyticsService.getUserActivity(userId, Number(days));
  }

  @Get('daily-stats')
  @ApiOperation({ summary: 'Get daily statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getDailyStats(@Query('days') days = 7) {
    return this.analyticsService.getDailyStats(Number(days));
  }
}
