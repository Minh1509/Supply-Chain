import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FaqMatcherService } from './faq-matcher.service';

@ApiTags('RAG')
@Controller('rag')
export class RagController {
  constructor(private readonly faqMatcher: FaqMatcherService) {}

  @Post('test-faq-match')
  @ApiOperation({ summary: 'Test FAQ matching' })
  async testFaqMatch(@Body() body: { query: string; threshold?: number }) {
    const match = await this.faqMatcher.match(body.query, body.threshold || 0.6);
    const topMatches = await this.faqMatcher.matchMultiple(body.query, 5);

    return {
      query: body.query,
      bestMatch: match
        ? {
            question: match.faq.question,
            answer: match.faq.answer,
            score: match.score,
            matchType: match.matchType,
          }
        : null,
      topMatches: topMatches.map((m) => ({
        question: m.faq.question,
        score: m.score,
        matchType: m.matchType,
      })),
    };
  }

  @Get('faqs')
  @ApiOperation({ summary: 'Get all FAQs' })
  async getAllFaqs() {
    const faqs = this.faqMatcher.getFAQs();
    return {
      total: faqs.length,
      faqs: faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
        keywords: faq.keywords,
      })),
    };
  }

  @Get('faqs/search')
  @ApiOperation({ summary: 'Search FAQs' })
  async searchFaqs(@Query('q') query: string) {
    const matches = await this.faqMatcher.matchMultiple(query, 10);
    return {
      query,
      results: matches.map((m) => ({
        question: m.faq.question,
        answer: m.faq.answer,
        score: m.score,
        matchType: m.matchType,
      })),
    };
  }
}
