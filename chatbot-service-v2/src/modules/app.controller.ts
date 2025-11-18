import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  root(@Res() res: Response) {
    const publicPath = process.env.NODE_ENV === 'production' 
      ? join(__dirname, '..', '..', 'public', 'index.html')
      : join(__dirname, '..', '..', 'public', 'index.html');
    
    return res.sendFile(publicPath);
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'chatbot-service-v2',
    };
  }
}
