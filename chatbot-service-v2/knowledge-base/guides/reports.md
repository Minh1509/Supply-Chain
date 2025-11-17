# Hướng dẫn Báo cáo và Phân tích

## Các loại Báo cáo

### 1. Báo cáo Tồn kho

#### Báo cáo Tồn kho Tổng quan

**Nội dung:**

- Tổng giá trị tồn kho
- Số lượng SKU
- Tồn kho theo kho
- Tồn kho theo loại sản phẩm

**Cách xem:**

- Vào Inventory > Reports > Inventory Overview
- Chọn thời điểm
- Chọn kho (hoặc tất cả)
- Export PDF/Excel

#### Báo cáo Nhập/Xuất/Tồn

**Nội dung:**

- Tồn đầu kỳ
- Nhập trong kỳ (theo nguồn)
- Xuất trong kỳ (theo lý do)
- Tồn cuối kỳ

**Công thức:**

```
Tồn cuối kỳ = Tồn đầu kỳ + Nhập - Xuất
```

#### Báo cáo Inventory Aging

**Mục đích:** Phát hiện hàng tồn kho lâu

**Phân loại:**

- 0-30 ngày: Mới
- 31-60 ngày: Bình thường
- 61-90 ngày: Cần chú ý
- 91-180 ngày: Tồn kho chậm
- > 180 ngày: Tồn kho ứ đọng

#### Báo cáo Stock Movement

**Nội dung:**

- Lịch sử nhập/xuất của từng sản phẩm
- Frequency of movement
- Average quantity per transaction
- Trend analysis

### 2. Báo cáo Bán hàng

#### Báo cáo Doanh thu

**Theo thời gian:**

- Hàng ngày
- Hàng tuần
- Hàng tháng
- Hàng quý
- Hàng năm

**Theo chiều:**

- Theo sản phẩm
- Theo khách hàng
- Theo nhân viên
- Theo khu vực

#### Báo cáo Sales Performance

**KPIs:**

- Total Revenue
- Number of Orders
- Average Order Value
- Conversion Rate (Quotation → SO)
- Customer Acquisition Cost

#### Báo cáo Top Products

**Nội dung:**

- Top sản phẩm bán chạy (theo số lượng)
- Top sản phẩm theo doanh thu
- Top sản phẩm theo lợi nhuận
- Sản phẩm bán chậm

#### Báo cáo Customer Analysis

**Nội dung:**

- Top customers
- New customers
- Repeat customers
- Customer lifetime value
- Churn rate

### 3. Báo cáo Mua hàng

#### Báo cáo Chi phí Mua hàng

**Nội dung:**

- Tổng chi phí mua
- Chi phí theo nhà cung cấp
- Chi phí theo sản phẩm
- So sánh với budget

#### Báo cáo Purchase Performance

**KPIs:**

- Number of POs
- Average PO value
- On-time delivery rate
- Quality acceptance rate
- Cost savings

#### Báo cáo Supplier Performance

**Đánh giá:**

- Delivery performance
- Quality performance
- Price competitiveness
- Service level
- Overall rating

### 4. Báo cáo Sản xuất

#### Báo cáo Production Output

**Nội dung:**

- Số lượng sản xuất
- Số lượng hoàn thành
- Số lượng lỗi
- Tỷ lệ đạt chất lượng

#### Báo cáo Production Efficiency

**KPIs:**

- OEE (Overall Equipment Effectiveness)
- Cycle time
- Downtime
- Yield rate
- Scrap rate

#### Báo cáo Material Consumption

**Nội dung:**

- Nguyên vật liệu sử dụng
- So sánh với BOM standard
- Material variance
- Waste analysis

### 5. Báo cáo Tài chính

#### Báo cáo Công nợ Phải thu

**Nội dung:**

- Tổng công nợ
- Công nợ theo khách hàng
- Aging analysis (0-30, 31-60, 61-90, >90 ngày)
- Overdue invoices

#### Báo cáo Công nợ Phải trả

**Nội dung:**

- Tổng công nợ
- Công nợ theo nhà cung cấp
- Payment schedule
- Overdue payments

#### Báo cáo Lợi nhuận

**Nội dung:**

- Gross profit
- Net profit
- Profit margin
- Profit by product
- Profit by customer

## Dashboard và KPIs

### Executive Dashboard

**Widgets:**

- Total Revenue (MTD, YTD)
- Total Orders
- Inventory Value
- Top Products
- Revenue Trend Chart
- Order Status Pie Chart

### Inventory Dashboard

**Widgets:**

- Total Stock Value
- Stock by Warehouse
- Low Stock Alerts
- Stock Movement Chart
- Inventory Turnover Ratio

### Sales Dashboard

**Widgets:**

- Sales Today/This Month
- Sales Target vs Actual
- Top Customers
- Sales Pipeline
- Conversion Funnel

### Production Dashboard

**Widgets:**

- MOs in Progress
- Production Output
- OEE Score
- Downtime Analysis
- Quality Metrics

## Tạo Báo cáo Tùy chỉnh

### Custom Report Builder

**Các bước:**

1. Vào Reports > Custom Report > Create
2. Chọn data source (Inventory, Sales, Purchase, etc.)
3. Chọn fields cần hiển thị
4. Thêm filters:
   - Date range
   - Company
   - Warehouse
   - Product category
   - Customer/Supplier
5. Chọn group by
6. Chọn sort order
7. Preview
8. Save template
9. Export (PDF, Excel, CSV)

### Scheduled Reports

**Tự động gửi báo cáo:**

1. Tạo custom report
2. Click Schedule
3. Chọn frequency:
   - Daily
   - Weekly
   - Monthly
   - Quarterly
4. Chọn recipients
5. Chọn format (PDF/Excel)
6. Save

## Phân tích Dữ liệu

### Trend Analysis

**Phân tích xu hướng:**

- Sales trend
- Inventory trend
- Cost trend
- Profit trend

**Công cụ:**

- Line charts
- Moving averages
- Year-over-year comparison

### Comparative Analysis

**So sánh:**

- This month vs Last month
- This year vs Last year
- Actual vs Budget
- Product A vs Product B

### ABC Analysis

**Phân loại sản phẩm:**

- A: 20% sản phẩm tạo 80% doanh thu
- B: 30% sản phẩm tạo 15% doanh thu
- C: 50% sản phẩm tạo 5% doanh thu

**Ứng dụng:**

- Focus vào sản phẩm A
- Tối ưu tồn kho
- Pricing strategy

### Forecasting

**Dự báo:**

- Sales forecast
- Demand forecast
- Inventory requirement

**Phương pháp:**

- Historical data analysis
- Seasonal patterns
- Trend projection

## Export và Chia sẻ

### Export Formats

- **PDF**: Cho presentation, in ấn
- **Excel**: Cho phân tích thêm
- **CSV**: Cho import vào tools khác
- **JSON**: Cho API integration

### Sharing Options

- Email trực tiếp
- Download link
- Scheduled delivery
- Dashboard sharing

## Tips & Best Practices

### Tạo Báo cáo Hiệu quả

- Xác định mục đích rõ ràng
- Chọn metrics phù hợp
- Sử dụng visualizations
- Keep it simple
- Update regularly

### Phân tích Dữ liệu

- So sánh với baseline
- Tìm patterns và trends
- Identify outliers
- Drill down vào details
- Take action based on insights

### Dashboard Design

- Prioritize important metrics
- Use appropriate chart types
- Consistent color scheme
- Real-time data when possible
- Mobile-friendly

### Data Quality

- Ensure data accuracy
- Regular data validation
- Clean up duplicates
- Handle missing data
- Document assumptions

## Các Metrics Quan trọng

### Inventory Metrics

- **Inventory Turnover**: Cost of Goods Sold / Average Inventory
- **Days Inventory Outstanding**: 365 / Inventory Turnover
- **Stock-out Rate**: Number of Stock-outs / Total Orders
- **Carrying Cost**: % of inventory value

### Sales Metrics

- **Revenue Growth Rate**: (Current - Previous) / Previous × 100%
- **Average Order Value**: Total Revenue / Number of Orders
- **Customer Acquisition Cost**: Marketing Cost / New Customers
- **Customer Lifetime Value**: Average Order Value × Purchase Frequency × Customer Lifespan

### Purchase Metrics

- **Purchase Price Variance**: (Actual Price - Standard Price) × Quantity
- **Supplier Lead Time**: Average days from PO to delivery
- **Quality Acceptance Rate**: Accepted Quantity / Total Received × 100%

### Production Metrics

- **OEE**: Availability × Performance × Quality
- **Cycle Time**: Total Production Time / Units Produced
- **First Pass Yield**: Good Units / Total Units × 100%
- **Capacity Utilization**: Actual Output / Maximum Capacity × 100%

## Troubleshooting

### Báo cáo chạy chậm

- Giảm date range
- Thêm filters
- Optimize database
- Schedule off-peak hours

### Dữ liệu không chính xác

- Check data source
- Verify filters
- Review calculations
- Check permissions

### Export lỗi

- Check file size
- Try different format
- Check disk space
- Contact support
