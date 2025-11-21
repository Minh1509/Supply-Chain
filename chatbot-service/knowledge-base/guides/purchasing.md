# Hướng dẫn Quản lý Mua hàng

## Quy trình Mua hàng

### 1. Request for Quotation (RFQ)

**Mục đích:** Yêu cầu báo giá từ nhà cung cấp

**Các bước:**

1. Vào Business > RFQ > Create New
2. Chọn sản phẩm cần mua và số lượng
3. Chọn danh sách nhà cung cấp (có thể chọn nhiều)
4. Set deadline nhận báo giá
5. Thêm yêu cầu đặc biệt (nếu có)
6. Gửi RFQ cho các nhà cung cấp

**Nhận báo giá:**

- Nhà cung cấp gửi báo giá qua hệ thống hoặc email
- Nhập thông tin báo giá vào hệ thống
- So sánh giá, chất lượng, thời gian giao hàng
- Chọn nhà cung cấp tốt nhất

### 2. Purchase Order (Đơn mua hàng)

**Tạo từ:** RFQ đã chọn nhà cung cấp hoặc tạo trực tiếp

**Thông tin cần thiết:**

- Nhà cung cấp (Supplier Company)
- Danh sách sản phẩm và số lượng
- Giá mua
- Phương thức thanh toán
- Địa chỉ giao hàng (kho nào)
- Ngày giao hàng yêu cầu

**Trạng thái:**

- Draft: Nháp
- Sent: Đã gửi nhà cung cấp
- Confirmed: Nhà cung cấp xác nhận
- Partial Received: Nhận một phần
- Received: Đã nhận đủ hàng
- Invoiced: Đã nhận hóa đơn
- Paid: Đã thanh toán
- Completed: Hoàn thành
- Cancelled: Đã hủy

### 3. Goods Receipt (Nhận hàng)

**Quy trình:**

1. Nhà cung cấp giao hàng
2. Kiểm tra hàng hóa:
   - Đối chiếu với PO
   - Kiểm tra số lượng
   - Kiểm tra chất lượng
   - Kiểm tra hạn sử dụng (nếu có)
3. Tạo Receive Ticket trong hệ thống
4. Nhập kho
5. Cập nhật trạng thái PO

**Xử lý sai lệch:**

- Thiếu hàng: Tạo Partial Receipt, đợi giao tiếp
- Hàng lỗi: Từ chối nhận, tạo Return
- Sai sản phẩm: Liên hệ nhà cung cấp ngay

### 4. Supplier Invoice (Hóa đơn nhà cung cấp)

**Nhận và xử lý:**

1. Nhận hóa đơn từ nhà cung cấp
2. Đối chiếu với PO và Goods Receipt
3. Kiểm tra:
   - Số lượng đúng
   - Giá đúng
   - Thuế đúng
   - Thông tin công ty đúng
4. Approve hóa đơn
5. Chuyển kế toán thanh toán

## Quản lý Nhà cung cấp

### Thêm Nhà cung cấp mới

**Thông tin cần thiết:**

- Tên công ty
- Mã số thuế
- Địa chỉ
- Người liên hệ
- Email, điện thoại
- Điều khoản thanh toán
- Sản phẩm cung cấp

### Đánh giá Nhà cung cấp

**Tiêu chí:**

- Chất lượng sản phẩm
- Giá cả cạnh tranh
- Thời gian giao hàng
- Dịch vụ hỗ trợ
- Độ tin cậy

**Rating:**

- 5 sao: Xuất sắc
- 4 sao: Tốt
- 3 sao: Trung bình
- 2 sao: Kém
- 1 sao: Rất kém

### Blacklist Nhà cung cấp

**Lý do:**

- Giao hàng kém chất lượng nhiều lần
- Thường xuyên giao muộn
- Không trung thực
- Vi phạm hợp đồng

## Báo cáo Mua hàng

### Báo cáo Chi phí

- Chi phí mua hàng theo tháng/quý/năm
- Chi phí theo nhà cung cấp
- Chi phí theo sản phẩm
- So sánh với budget

### Báo cáo Đơn hàng

- Số lượng PO
- Giá trị PO trung bình
- PO pending
- PO overdue
- Tỷ lệ giao đúng hạn

### Báo cáo Nhà cung cấp

- Top nhà cung cấp theo giá trị
- Đánh giá nhà cung cấp
- Tỷ lệ giao đúng hạn
- Tỷ lệ hàng lỗi

### Báo cáo Tồn kho

- Nguyên vật liệu sắp hết
- Nguyên vật liệu tồn kho lâu
- Giá trị tồn kho
- Turnover ratio

## Tips & Best Practices

### Lập kế hoạch Mua hàng

- Dự báo nhu cầu dựa trên Sales Forecast
- Tính toán safety stock
- Xem xét lead time của nhà cung cấp
- Tối ưu hóa batch size

### Đàm phán với Nhà cung cấp

- Mua số lượng lớn để được giá tốt
- Thanh toán sớm để được discount
- Hợp đồng dài hạn để ổn định giá
- Xây dựng quan hệ tốt

### Quản lý Rủi ro

- Không phụ thuộc vào 1 nhà cung cấp
- Có nhà cung cấp backup
- Kiểm tra tài chính nhà cung cấp
- Có hợp đồng rõ ràng

### Tối ưu Chi phí

- So sánh giá nhiều nhà cung cấp
- Tận dụng discount và promotion
- Giảm chi phí vận chuyển
- Tối ưu hóa inventory level

## Xử lý Tình huống

### Nhà cung cấp giao muộn

1. Liên hệ nhà cung cấp ngay
2. Yêu cầu timeline cụ thể
3. Tìm giải pháp thay thế nếu cần
4. Cập nhật production plan
5. Thông báo sales team

### Hàng giao không đúng chất lượng

1. Chụp ảnh, ghi nhận vấn đề
2. Từ chối nhận hàng
3. Liên hệ nhà cung cấp
4. Yêu cầu đổi hàng hoặc hoàn tiền
5. Cập nhật đánh giá nhà cung cấp

### Giá tăng đột ngột

1. Xác nhận lý do tăng giá
2. Đàm phán với nhà cung cấp
3. Tìm nhà cung cấp thay thế
4. Cập nhật cost trong hệ thống
5. Thông báo sales team điều chỉnh giá bán

### Nhà cung cấp ngừng cung cấp

1. Tìm nhà cung cấp thay thế ngay
2. Kiểm tra tồn kho hiện tại
3. Đánh giá impact lên production
4. Thông báo các bộ phận liên quan
5. Cập nhật supplier list

## Tích hợp với Module khác

### Với Inventory

- Tự động tạo Receive Ticket khi nhận hàng
- Cập nhật tồn kho real-time
- Cảnh báo khi tồn kho thấp
- Tự động suggest PO

### Với Operation

- Kiểm tra nhu cầu nguyên vật liệu
- Đồng bộ production schedule
- Cảnh báo thiếu nguyên vật liệu

### Với Accounting

- Tự động tạo journal entries
- Theo dõi công nợ nhà cung cấp
- Lập kế hoạch thanh toán
- Đối soát với nhà cung cấp

### Với Notification

- Thông báo PO mới
- Reminder giao hàng
- Alert PO overdue
- Thông báo hàng về kho
