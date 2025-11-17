import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ChatLogEntity } from './entities/chat-log.entity';
import { MetricsEntity } from './entities/metrics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ChatLogEntity)
    private readonly chatLogRepo: Repository<ChatLogEntity>,
    @InjectRepository(MetricsEntity)
    private readonly metricsRepo: Repository<MetricsEntity>,
  ) {}

  async logChat(data: {
    conversationId: string;
    userId?: string;
    userRole?: string;
    userMessage: string;
    botResponse: string;
    intent?: string;
    entities?: Record<string, any>;
    responseTime: number;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const log = this.chatLogRepo.create(data);
    await this.chatLogRepo.save(log);
  }

  async getPopularIntents(days = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await this.chatLogRepo
      .createQueryBuilder('log')
      .select('log.intent', 'intent')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :startDate', { startDate })
      .andWhere('log.intent IS NOT NULL')
      .groupBy('log.intent')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return results;
  }

  async getAverageResponseTime(days = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.chatLogRepo
      .createQueryBuilder('log')
      .select('AVG(log.responseTime)', 'avgTime')
      .where('log.createdAt >= :startDate', { startDate })
      .getRawOne();

    return parseFloat(result?.avgTime || '0');
  }

  async getSuccessRate(days = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const total = await this.chatLogRepo.count({
      where: { createdAt: Between(startDate, new Date()) },
    });

    const successful = await this.chatLogRepo.count({
      where: {
        createdAt: Between(startDate, new Date()),
        success: true,
      },
    });

    return total > 0 ? (successful / total) * 100 : 0;
  }

  async getUserActivity(userId: string, days = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalMessages = await this.chatLogRepo.count({
      where: { userId, createdAt: Between(startDate, new Date()) },
    });

    const intents = await this.chatLogRepo
      .createQueryBuilder('log')
      .select('log.intent', 'intent')
      .addSelect('COUNT(*)', 'count')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt >= :startDate', { startDate })
      .groupBy('log.intent')
      .getRawMany();

    return {
      userId,
      totalMessages,
      intents,
      period: `${days} days`,
    };
  }

  async getDailyStats(days = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await this.chatLogRepo
      .createQueryBuilder('log')
      .select('DATE(log.createdAt)', 'date')
      .addSelect('COUNT(*)', 'totalMessages')
      .addSelect('AVG(log.responseTime)', 'avgResponseTime')
      .addSelect('SUM(CASE WHEN log.success = true THEN 1 ELSE 0 END)', 'successCount')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('DATE(log.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      date: r.date,
      totalMessages: parseInt(r.totalMessages),
      avgResponseTime: parseFloat(r.avgResponseTime),
      successRate: (parseInt(r.successCount) / parseInt(r.totalMessages)) * 100,
    }));
  }

  async saveMetric(
    metricType: string,
    metricName: string,
    value: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const metric = this.metricsRepo.create({
      metricType,
      metricName,
      value,
      date: new Date(),
      metadata,
    });
    await this.metricsRepo.save(metric);
  }

  async getMetrics(metricType: string, days = 7): Promise<MetricsEntity[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.metricsRepo.find({
      where: {
        metricType,
        date: Between(startDate, new Date()),
      },
      order: { date: 'ASC' },
    });
  }
}
