import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Logger } from '../../common/utils/logger.util';

@Injectable()
export class KnowledgeLoaderService implements OnModuleInit {
  private documents: any[] = [];

  async onModuleInit() {
    await this.loadKnowledgeBase();
  }

  private async loadKnowledgeBase() {
    try {
      this.loadMarkdownGuides();
      this.loadFAQs();
      Logger.log(
        `✅ Loaded ${this.documents.length} documents into knowledge base`,
        'KnowledgeLoader',
      );
    } catch (error) {
      Logger.error('Error loading knowledge base', error.message, 'KnowledgeLoader');
    }
  }

  private loadMarkdownGuides() {
    const guidesPath = join(process.cwd(), 'knowledge-base', 'guides');

    try {
      const files = readdirSync(guidesPath);

      files.forEach((file) => {
        if (file.endsWith('.md')) {
          const content = readFileSync(join(guidesPath, file), 'utf-8');
          const sections = this.parseMarkdown(content);

          sections.forEach((section, index) => {
            this.documents.push({
              id: `${file}-${index}`,
              content: section.content,
              metadata: {
                type: 'guide',
                source: file,
                title: section.title,
              },
            });
          });
        }
      });
    } catch (error) {
      Logger.warn('Could not load markdown guides: ' + error.message, 'KnowledgeLoader');
    }
  }

  private loadFAQs() {
    const faqPath = join(process.cwd(), 'knowledge-base', 'faqs.json');

    try {
      const content = readFileSync(faqPath, 'utf-8');
      const faqs = JSON.parse(content);

      faqs.forEach((faq: any, index: number) => {
        this.documents.push({
          id: `faq-${index}`,
          content: `Câu hỏi: ${faq.question}\nTrả lời: ${faq.answer}`,
          metadata: {
            type: 'faq',
            question: faq.question,
            answer: faq.answer,
          },
        });
      });
    } catch (error) {
      Logger.warn('Could not load FAQs: ' + error.message, 'KnowledgeLoader');
    }
  }

  private parseMarkdown(content: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    const lines = content.split('\n');

    let currentSection = { title: '', content: '' };

    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        if (currentSection.content) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          title: line.replace('## ', '').trim(),
          content: '',
        };
      } else if (currentSection.title) {
        currentSection.content += line + '\n';
      }
    });

    if (currentSection.content) {
      sections.push(currentSection);
    }

    return sections;
  }

  getDocuments() {
    return this.documents;
  }
}
