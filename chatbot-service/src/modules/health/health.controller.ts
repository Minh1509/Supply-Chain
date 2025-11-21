import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LlmService } from '../rag/llm.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly llmService: LlmService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    const [ollamaHealthy, rabbitmqHealthy] = await Promise.all([
      this.llmService.checkHealth(),
      this.rabbitmqService.checkHealth(),
    ]);

    const allHealthy = ollamaHealthy && rabbitmqHealthy;

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'chatbot-service',
      version: '1.0.0',
      dependencies: {
        ollama: ollamaHealthy ? 'ok' : 'down',
        rabbitmq: rabbitmqHealthy ? 'ok' : 'down',
      },
    };
  }

  @Get('ollama')
  @ApiOperation({ summary: 'Check Ollama health' })
  async ollamaHealth() {
    const isHealthy = await this.llmService.checkHealth();
    return {
      status: isHealthy ? 'ok' : 'down',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('rabbitmq')
  @ApiOperation({ summary: 'Check RabbitMQ health' })
  async rabbitmqHealth() {
    const isHealthy = await this.rabbitmqService.checkHealth();
    return {
      status: isHealthy ? 'ok' : 'down',
      timestamp: new Date().toISOString(),
    };
  }
}
