import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Logger } from '../../common/utils/logger.util';

interface FAQ {
  question: string;
  answer: string;
  keywords?: string[];
  variations?: string[];
}

interface MatchResult {
  faq: FAQ;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'keyword';
}

@Injectable()
export class FaqMatcherService implements OnModuleInit {
  private faqs: FAQ[] = [];
  private questionIndex: Map<string, FAQ> = new Map();

  async onModuleInit() {
    await this.loadFAQs();
    this.buildIndex();
  }

  private async loadFAQs() {
    try {
      const faqPath = join(process.cwd(), 'knowledge-base', 'faqs.json');
      const content = readFileSync(faqPath, 'utf-8');
      const rawFaqs = JSON.parse(content);

      this.faqs = rawFaqs.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer,
        keywords: this.extractKeywords(faq.question + ' ' + faq.answer),
        variations: this.generateVariations(faq.question),
      }));

      Logger.log(`✅ Loaded ${this.faqs.length} FAQs`, 'FaqMatcher');
    } catch (error) {
      Logger.error('Error loading FAQs', error.message, 'FaqMatcher');
    }
  }

  private buildIndex() {
    // Index by normalized questions for fast exact match
    this.faqs.forEach((faq) => {
      const normalized = this.normalize(faq.question);
      this.questionIndex.set(normalized, faq);

      // Also index variations
      faq.variations?.forEach((variation) => {
        this.questionIndex.set(this.normalize(variation), faq);
      });
    });
  }

  async match(query: string, threshold = 0.6): Promise<MatchResult | null> {
    // 1. Try exact match first (fastest)
    const exactMatch = this.exactMatch(query);
    if (exactMatch) {
      return { faq: exactMatch, score: 1.0, matchType: 'exact' };
    }

    // 2. Try fuzzy match (keyword-based, lightweight)
    const fuzzyMatches = this.fuzzyMatch(query);
    if (fuzzyMatches.length > 0 && fuzzyMatches[0].score >= threshold) {
      return fuzzyMatches[0];
    }

    return null;
  }

  async matchMultiple(query: string, topK = 3): Promise<MatchResult[]> {
    const matches = this.fuzzyMatch(query);
    return matches.slice(0, topK);
  }

  private exactMatch(query: string): FAQ | null {
    const normalized = this.normalize(query);
    return this.questionIndex.get(normalized) || null;
  }

  private fuzzyMatch(query: string): MatchResult[] {
    const queryKeywords = this.extractKeywords(query);
    const queryNormalized = this.normalize(query);

    const scored = this.faqs.map((faq) => {
      let score = 0;

      // 1. Keyword overlap score (40%)
      const keywordScore = this.keywordOverlap(queryKeywords, faq.keywords || []);
      score += keywordScore * 0.4;

      // 2. String similarity score (40%)
      const similarityScore = this.stringSimilarity(
        queryNormalized,
        this.normalize(faq.question),
      );
      score += similarityScore * 0.4;

      // 3. Variation match bonus (20%)
      const variationScore = this.checkVariations(queryNormalized, faq.variations || []);
      score += variationScore * 0.2;

      return { faq, score, matchType: 'fuzzy' as const };
    });

    return scored.filter((m) => m.score > 0).sort((a, b) => b.score - a.score);
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractKeywords(text: string): string[] {
    const normalized = this.normalize(text);
    const stopWords = new Set([
      'la', 'gi', 'cua', 'va', 'thi', 'co', 'khong', 'nhu', 'the', 'nao',
      'lam', 'sao', 'de', 'duoc', 'o', 'trong', 'ngoai', 'tren', 'duoi',
      'is', 'are', 'was', 'were', 'the', 'a', 'an', 'and', 'or', 'but',
      'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'how', 'what',
    ]);

    return normalized
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));
  }

  private keywordOverlap(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));

    return intersection.size / Math.max(set1.size, set2.size);
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private checkVariations(query: string, variations: string[]): number {
    for (const variation of variations) {
      const normalized = this.normalize(variation);
      if (query.includes(normalized) || normalized.includes(query)) {
        return 1.0;
      }
    }
    return 0;
  }

  private generateVariations(question: string): string[] {
    const variations: string[] = [];
    const normalized = this.normalize(question);

    // Remove question words
    const withoutQuestionWords = normalized
      .replace(/^(lam sao|the nao|nhu the nao|how|what|where|when)/g, '')
      .trim();
    if (withoutQuestionWords !== normalized) {
      variations.push(withoutQuestionWords);
    }

    // Remove "để" at the beginning
    const withoutDe = normalized.replace(/^de\s+/g, '').trim();
    if (withoutDe !== normalized) {
      variations.push(withoutDe);
    }

    return variations;
  }

  getFAQs(): FAQ[] {
    return this.faqs;
  }

  getFAQsByCategory(category: string): FAQ[] {
    return this.faqs.filter((faq) => faq.keywords?.includes(category));
  }
}
