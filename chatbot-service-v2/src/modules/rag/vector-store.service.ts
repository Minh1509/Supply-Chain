import { Injectable, OnModuleInit } from '@nestjs/common';
import { KnowledgeLoaderService } from './knowledge-loader.service';
import { Logger } from '../../common/utils/logger.util';

interface Document {
  id: string;
  content: string;
  metadata: any;
  embedding?: number[];
}

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private documents: Document[] = [];

  constructor(private readonly knowledgeLoader: KnowledgeLoaderService) {}

  async onModuleInit() {
    await this.initializeKnowledgeBase();
  }

  private async initializeKnowledgeBase() {
    const loadedDocs = this.knowledgeLoader.getDocuments();
    this.documents = loadedDocs.length > 0 ? loadedDocs : this.getDefaultDocuments();
    Logger.log(
      `📚 Vector store initialized with ${this.documents.length} documents`,
      'VectorStore',
    );
  }

  private getDefaultDocuments(): Document[] {
    return [
      {
        id: '1',
        content:
          'Để kiểm tra tồn kho, bạn cần truy cập module Inventory và chọn Warehouse. Hệ thống sẽ hiển thị số lượng tồn kho theo từng sản phẩm và kho.',
        metadata: { type: 'guide', topic: 'inventory' },
      },
      {
        id: '2',
        content:
          'Phiếu xuất kho (Issue Ticket) được tạo khi cần xuất hàng từ kho. Cần có thông tin: sản phẩm, số lượng, kho xuất, lý do xuất.',
        metadata: { type: 'guide', topic: 'issue_ticket' },
      },
      {
        id: '3',
        content:
          'Phiếu nhập kho (Receive Ticket) được tạo khi nhập hàng vào kho. Cần có thông tin: sản phẩm, số lượng, kho nhập, nguồn gốc.',
        metadata: { type: 'guide', topic: 'receive_ticket' },
      },
      {
        id: '4',
        content:
          'Lệnh sản xuất (Manufacture Order) được tạo từ Sales Order. Cần có BOM (Bill of Materials) và kiểm tra tồn kho nguyên vật liệu.',
        metadata: { type: 'guide', topic: 'manufacture' },
      },
      {
        id: '5',
        content:
          'Báo cáo tồn kho theo tháng hiển thị: tồn đầu kỳ, nhập trong kỳ, xuất trong kỳ, tồn cuối kỳ. Có thể lọc theo kho và sản phẩm.',
        metadata: { type: 'guide', topic: 'report' },
      },
      {
        id: '6',
        content:
          'Purchase Order (PO) được tạo sau khi duyệt Request for Quotation (RFQ). PO bao gồm thông tin nhà cung cấp, sản phẩm, số lượng, giá.',
        metadata: { type: 'guide', topic: 'purchasing' },
      },
      {
        id: '7',
        content:
          'Sales Order được tạo từ Quotation đã được khách hàng chấp nhận. Sau đó tạo Invoice và Delivery Order.',
        metadata: { type: 'guide', topic: 'sales' },
      },
    ];
  }

  async search(query: string, embedding: number[], topK = 3): Promise<Document[]> {
    if (this.documents.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const scored = this.documents.map((doc) => {
      const contentLower = doc.content.toLowerCase();
      let score = 0;

      const words = queryLower.split(/\s+/);
      words.forEach((word) => {
        if (contentLower.includes(word)) {
          score += 1;
        }
      });

      return { doc, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => item.doc);
  }

  async addDocument(doc: Document) {
    this.documents.push(doc);
  }

  async addDocuments(docs: Document[]) {
    this.documents.push(...docs);
  }
}
