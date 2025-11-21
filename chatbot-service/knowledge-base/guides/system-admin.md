# Hướng dẫn Quản trị Hệ thống

## Quản lý Người dùng

### Tạo User mới

**Các bước:**

1. Vào Settings > Users > Create New
2. Điền thông tin:
   - Username (unique)
   - Email
   - Full Name
   - Phone
   - Department
3. Chọn Role
4. Chọn Company (có thể chọn nhiều)
5. Set password hoặc gửi email activation
6. Save

### Roles và Permissions

#### Admin

**Quyền:**

- Full access tất cả modules
- Quản lý users
- Quản lý system settings
- View all data
- Approve workflows

#### Manager

**Quyền:**

- View và edit data trong phạm vi
- Approve orders
- View reports
- Manage team members
- Cannot change system settings

#### Warehouse Staff

**Quyền:**

- Quản lý tồn kho
- Tạo/edit Receive/Issue Tickets
- View inventory reports
- Cannot approve orders

#### Sales

**Quyền:**

- Tạo/edit Quotations, Sales Orders
- View customer data
- View sales reports
- Cannot access inventory details

#### Accountant

**Quyền:**

- View financial data
- Manage invoices
- View payment status
- Generate financial reports
- Cannot edit orders

#### Viewer

**Quyền:**

- Read-only access
- View reports
- Cannot create/edit/delete

### Custom Roles

**Tạo role tùy chỉnh:**

1. Settings > Roles > Create Custom
2. Đặt tên role
3. Chọn permissions chi tiết:
   - Module access
   - Create/Read/Update/Delete
   - Approve/Reject
   - Export data
4. Save

## Quản lý Company

### Multi-Company Setup

**Hệ thống hỗ trợ nhiều công ty:**

- Mỗi company có data riêng
- User có thể thuộc nhiều company
- Switch company dễ dàng
- Consolidated reports

### Tạo Company mới

**Thông tin:**

- Company Name
- Tax ID
- Address
- Phone, Email
- Logo
- Currency
- Timezone
- Fiscal Year

### Company Settings

**Cấu hình:**

- Default warehouse
- Default payment terms
- Invoice template
- Email templates
- Approval workflows

## System Configuration

### General Settings

**Cấu hình chung:**

- System name
- Default language
- Date format
- Number format
- Currency
- Timezone

### Email Settings

**SMTP Configuration:**

- SMTP server
- Port
- Username/Password
- Encryption (SSL/TLS)
- From email
- From name

**Email Templates:**

- Order confirmation
- Invoice
- Payment reminder
- Shipping notification
- Custom templates

### Notification Settings

**Channels:**

- Email
- In-app notification
- SMS (if configured)
- Push notification

**Events:**

- New order
- Order status change
- Low stock alert
- Payment received
- Approval required

### Workflow Configuration

**Approval Workflows:**

1. Settings > Workflows > Configure
2. Chọn document type:
   - Purchase Order
   - Sales Order
   - Issue Ticket
   - Receive Ticket
3. Define approval steps:
   - Step 1: Manager approval (if amount > 10M)
   - Step 2: Director approval (if amount > 50M)
4. Set approvers
5. Set timeout rules
6. Save

### Integration Settings

**API Configuration:**

- Enable/Disable API
- API keys
- Rate limiting
- Webhook URLs

**Third-party Integrations:**

- Accounting software
- Shipping providers
- Payment gateways
- CRM systems

## Data Management

### Backup và Restore

**Automatic Backup:**

- Daily backup at 2 AM
- Retention: 30 days
- Storage: Cloud storage

**Manual Backup:**

1. Settings > System > Backup
2. Click "Backup Now"
3. Wait for completion
4. Download backup file

**Restore:**

1. Settings > System > Restore
2. Upload backup file
3. Confirm restore
4. System will restart

### Data Import

**Import từ Excel:**

1. Settings > Data Import
2. Chọn entity type:
   - Items
   - Customers
   - Suppliers
   - Inventory
3. Download template
4. Fill data vào template
5. Upload file
6. Validate data
7. Import

**Lưu ý:**

- Check data format
- Unique fields must be unique
- Required fields must have value
- Date format: YYYY-MM-DD

### Data Export

**Export toàn bộ data:**

1. Settings > Data Export
2. Chọn entities
3. Chọn date range
4. Chọn format (CSV, Excel, JSON)
5. Export

### Data Cleanup

**Xóa dữ liệu cũ:**

- Archive old orders
- Delete draft documents
- Clean up logs
- Optimize database

**Lưu ý:**

- Backup trước khi xóa
- Không xóa data có liên quan
- Keep audit trail

## Security

### Password Policy

**Cấu hình:**

- Minimum length: 8 characters
- Require uppercase
- Require numbers
- Require special characters
- Password expiry: 90 days
- Cannot reuse last 5 passwords

### Two-Factor Authentication

**Enable 2FA:**

1. Settings > Security > 2FA
2. Enable for all users hoặc specific roles
3. Users setup 2FA in profile
4. Use authenticator app

### IP Whitelist

**Restrict access:**

1. Settings > Security > IP Whitelist
2. Add allowed IP addresses
3. Block all other IPs

### Session Management

**Cấu hình:**

- Session timeout: 30 minutes
- Max concurrent sessions: 3
- Force logout on password change

### Audit Log

**Track activities:**

- User login/logout
- Data changes
- Permission changes
- System configuration changes

**View logs:**

1. Settings > Audit Log
2. Filter by:
   - User
   - Action type
   - Date range
   - Entity
3. Export logs

## Performance Optimization

### Database Optimization

**Maintenance tasks:**

- Rebuild indexes
- Update statistics
- Clean up temp tables
- Archive old data

### Cache Management

**Clear cache:**

1. Settings > System > Cache
2. Click "Clear Cache"
3. Types:
   - Application cache
   - Database cache
   - Session cache

### System Monitoring

**Monitor:**

- CPU usage
- Memory usage
- Disk space
- Database size
- Active users
- Response time

**Alerts:**

- High CPU usage
- Low disk space
- Database errors
- Slow queries

## Troubleshooting

### Common Issues

#### Users không login được

**Kiểm tra:**

- Username/password đúng chưa
- Account có bị lock không
- Password có expired không
- 2FA có issue không

**Giải pháp:**

- Reset password
- Unlock account
- Disable 2FA temporarily

#### System chạy chậm

**Kiểm tra:**

- Database size
- Number of active users
- Long-running queries
- Server resources

**Giải pháp:**

- Optimize database
- Archive old data
- Upgrade server
- Add caching

#### Email không gửi được

**Kiểm tra:**

- SMTP settings
- Network connectivity
- Email quota
- Spam filter

**Giải pháp:**

- Verify SMTP config
- Check firewall
- Contact email provider

#### Data không sync

**Kiểm tra:**

- Integration status
- API credentials
- Network connection
- Error logs

**Giải pháp:**

- Restart integration
- Update credentials
- Manual sync
- Contact support

## Maintenance

### Regular Tasks

**Hàng ngày:**

- Check system health
- Review error logs
- Monitor disk space

**Hàng tuần:**

- Review user activities
- Check backup status
- Update security patches

**Hàng tháng:**

- Database optimization
- Archive old data
- Review permissions
- Update documentation

### System Updates

**Update process:**

1. Backup data
2. Test in staging
3. Schedule downtime
4. Apply update
5. Verify functionality
6. Monitor for issues

### Disaster Recovery

**Recovery plan:**

1. Identify issue
2. Assess impact
3. Restore from backup
4. Verify data integrity
5. Resume operations
6. Post-mortem analysis

## Best Practices

### Security

- Regular password changes
- Enable 2FA
- Limit admin access
- Review permissions regularly
- Monitor audit logs

### Performance

- Regular database maintenance
- Archive old data
- Optimize queries
- Use caching
- Monitor resources

### Data Management

- Regular backups
- Data validation
- Clean up duplicates
- Document processes
- Train users

### User Management

- Principle of least privilege
- Regular access reviews
- Offboarding process
- Training programs
- Clear documentation
