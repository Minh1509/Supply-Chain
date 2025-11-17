import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreferenceEntity } from './entities/user-preference.entity';

@Injectable()
export class PersonalizationService {
  constructor(
    @InjectRepository(UserPreferenceEntity)
    private readonly preferenceRepo: Repository<UserPreferenceEntity>,
  ) {}

  async getUserPreferences(userId: string): Promise<UserPreferenceEntity> {
    let preferences = await this.preferenceRepo.findOne({ where: { userId } });

    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async createDefaultPreferences(userId: string): Promise<UserPreferenceEntity> {
    const preferences = this.preferenceRepo.create({
      userId,
      defaultCompanyId: 1,
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      favoriteItems: [],
      favoriteWarehouses: [],
      notificationPreferences: {
        email: true,
        push: false,
      },
      customSettings: {},
    });

    return this.preferenceRepo.save(preferences);
  }

  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferenceEntity>,
  ): Promise<UserPreferenceEntity> {
    await this.preferenceRepo.update({ userId }, updates);
    return this.getUserPreferences(userId);
  }

  async addFavoriteItem(userId: string, itemId: string): Promise<void> {
    const preferences = await this.getUserPreferences(userId);
    const favoriteItems = preferences.favoriteItems || [];

    if (!favoriteItems.includes(itemId)) {
      favoriteItems.push(itemId);
      await this.preferenceRepo.update({ userId }, { favoriteItems });
    }
  }

  async removeFavoriteItem(userId: string, itemId: string): Promise<void> {
    const preferences = await this.getUserPreferences(userId);
    const favoriteItems = (preferences.favoriteItems || []).filter((id) => id !== itemId);
    await this.preferenceRepo.update({ userId }, { favoriteItems });
  }

  async getPersonalizedPrompt(userId: string, userRole: string): Promise<string> {
    const preferences = await this.getUserPreferences(userId);

    const rolePrompts = {
      admin: 'Bạn có quyền truy cập đầy đủ vào tất cả chức năng.',
      manager: 'Bạn có thể xem báo cáo và quản lý nhân viên.',
      warehouse_staff: 'Bạn có thể quản lý kho hàng và tạo phiếu xuất/nhập.',
      sales_staff: 'Bạn có thể quản lý đơn hàng và khách hàng.',
      default: 'Bạn có quyền truy cập cơ bản.',
    };

    const rolePrompt = rolePrompts[userRole] || rolePrompts.default;

    let prompt = `Người dùng: ${preferences.userName || userId}\n`;
    prompt += `Vai trò: ${userRole}\n`;
    prompt += `${rolePrompt}\n`;

    if (preferences.defaultWarehouseId) {
      prompt += `Kho mặc định: ${preferences.defaultWarehouseId}\n`;
    }

    if (preferences.favoriteItems?.length > 0) {
      prompt += `Sản phẩm yêu thích: ${preferences.favoriteItems.join(', ')}\n`;
    }

    return prompt;
  }

  async canAccessFeature(userId: string, userRole: string, feature: string): Promise<boolean> {
    const rolePermissions = {
      admin: ['*'],
      manager: ['view_reports', 'manage_staff', 'view_inventory', 'view_orders'],
      warehouse_staff: ['view_inventory', 'create_ticket', 'view_warehouse'],
      sales_staff: ['view_orders', 'create_order', 'view_customers'],
      viewer: ['view_inventory', 'view_orders'],
    };

    const permissions = rolePermissions[userRole] || [];

    if (permissions.includes('*')) return true;
    if (permissions.includes(feature)) return true;

    return false;
  }
}
