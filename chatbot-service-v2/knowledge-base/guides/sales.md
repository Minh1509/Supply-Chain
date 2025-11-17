# Hướng dẫn Quản lý Bán hàng

## Quy trình Bán hàng

### 1. Quotation (Báo giá)

**Mục đích:** Gửi báo giá cho khách hàng tiềm năng

**Các bước:**

1. Vào Business > Quotation > Create New
2. Chọn khách hàng (Customer Company)
3. Thêm sản phẩm và số lượng
4. Hệ thống tự động tính giá (có thể điều chỉnh)
5. Thêm discount nếu có
6. Thêm terms & conditions
7. Save và gửi cho khách

**Trạng thái:**

- Draft: Đang soạn thảo
- Sent: Đã gửi khách
- Accepted: Khách chấp nhận → Chuyển thành SO
- Rejected: Khách từ chối
- Expired: Hết hạn

### 2. Sales Order (Đơn bán hàng)

**Tạo từ:** Quotation được chấp nhận hoặc tạo trực tiếp

**Thông tin cần thiết:**

- Khách hàng
- Danh sách sản phẩm và số lượng
- Giá bán
- Phương thức thanh toán
- Địa chỉ giao hàng
- Ngày giao hàng dự kiến

**Trạng thái:**

- Draft: Nháp
- Confirmed: Đã xác nhận
- Processing: Đang xử lý (sản xuất/chuẩn bị hàng)
- Ready to Deliver: Sẵn sàng giao
- Delivered: Đã giao hàng
- Invoiced: Đã xuất hóa đơn
- Completed: Hoàn thành
- Cancelled: Đã hủy

### 3. Delivery Order (Phiếu giao hàng)

**Tạo từ:** Sales Order đã confirmed

**Quy trình:**

1. Vào Business > Delivery Order > Create from SO
2. Chọn Sales Order
3. Xác nhận sản phẩm và số lượng giao
4. Chọn kho xuất hàng
5. Nhập thông tin vận chuyển:
   - Đơn vị vận chuyển
   - Mã vận đơn
   - Người nhận
   - Địa chỉ giao hàng
6. In phiếu giao hàng
7. Cập nhật trạng thái khi giao xong

### 4. Invoice (Hóa đơn)

**Tạo từ:** Sales Order hoặc Delivery Order

**Loại hóa đơn:**

- VAT Invoice: Hóa đơn GTGT
- Sales Invoice: Hóa đơn bán hàng
- Proforma Invoice: Hóa đơn tạm tính

**Thông tin:**

- Thông tin công ty
- Thông tin khách hàng
- Danh sách sản phẩm
- Giá, thuế, tổng tiền
- Phương thức thanh toán
- Ngày xuất hóa đơn

## Báo cáo Bán hàng

### Báo cáo Doanh thu

- Doanh thu theo tháng/quý/năm
- Doanh thu theo sản phẩm
- Doanh thu theo khách hàng
- Doanh thu theo nhân viên bán hàng

### Báo cáo Đơn hàng

- Số lượng đơn hàng
- Giá trị đơn hàng trung bình
- Tỷ lệ chuyển đổi từ Quotation sang SO
- Đơn hàng pending
- Đơn hàng overdue

### Báo cáo Khách hàng

- Top khách hàng theo doanh thu
- Khách hàng mới
- Tỷ lệ khách hàng quay lại
- Công nợ khách hàng

## Tips & Best Practices

### Quản lý Quotation

- Set expiry date hợp lý (thường 7-30 ngày)
- Follow up khách hàng trước khi hết hạn
- Lưu lý do nếu khách từ chối
- Có thể tạo nhiều version của 1 quotation

### Quản lý Sales Order

- Xác nhận tồn kho trước khi confirm SO
- Set delivery date thực tế
- Cập nhật trạng thái đúng lúc
- Giao tiếp với khách về tiến độ

### Quản lý Giao hàng

- Kiểm tra hàng trước khi giao
- Chụp ảnh hàng hóa
- Lấy chữ ký người nhận
- Cập nhật tracking number

### Quản lý Hóa đơn

- Xuất hóa đơn đúng thời hạn
- Kiểm tra thông tin trước khi xuất
- Lưu trữ hóa đơn đầy đủ
- Theo dõi thanh toán

## Xử lý Tình huống

### Khách hàng muốn hủy đơn

1. Kiểm tra trạng thái đơn hàng
2. Nếu chưa sản xuất: Có thể hủy
3. Nếu đã sản xuất: Thương lượng với khách
4. Cập nhật trạng thái và lý do

### Khách hàng muốn đổi/trả hàng

1. Kiểm tra chính sách đổi/trả
2. Tạo Return Order
3. Kiểm tra hàng trả về
4. Hoàn tiền hoặc đổi hàng mới
5. Cập nhật tồn kho

### Giao hàng bị delay

1. Thông báo khách ngay
2. Giải thích lý do
3. Đưa ra timeline mới
4. Có compensation nếu cần

### Khách chưa thanh toán

1. Gửi reminder trước hạn
2. Gọi điện nhắc nhở
3. Tạm dừng giao hàng mới nếu quá hạn
4. Báo cáo lên quản lý

## Tích hợp với Module khác

### Với Inventory

- Kiểm tra tồn kho khi tạo SO
- Tự động reserve hàng khi confirm SO
- Tự động xuất kho khi giao hàng

### Với Operation

- Tạo Manufacture Order từ SO
- Theo dõi tiến độ sản xuất
- Thông báo khi hàng sẵn sàng

### Với Accounting

- Tự động tạo journal entries
- Theo dõi công nợ
- Đối soát thanh toán

### Với Notification

- Thông báo đơn hàng mới
- Thông báo thay đổi trạng thái
- Reminder thanh toán
- Alert đơn hàng overdue
