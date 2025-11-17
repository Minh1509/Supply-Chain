# Hướng dẫn Quản lý Kho

## Tổng quan Quản lý Kho

Hệ thống quản lý kho giúp theo dõi:

- Tồn kho real-time
- Nhập/xuất/chuyển kho
- Vị trí lưu trữ
- Serial number/Batch tracking
- Cảnh báo tồn kho
- Báo cáo và phân tích

## Kiểm tra Tồn kho

### Xem Tồn kho Tổng quan

1. Truy cập module **Inventory**
2. Chọn **Warehouse** để xem danh sách kho
3. Click vào kho cụ thể để xem chi tiết tồn kho
4. Có thể lọc theo:
   - Sản phẩm
   - Loại sản phẩm
   - Ngày tháng
   - Trạng thái (available, on-demand, reserved)

### Các loại Tồn kho

- **Physical Stock**: Tồn kho thực tế trong kho
- **Available**: Có thể xuất ngay = Physical - Reserved
- **On-demand**: Đã được đặt trước (từ SO)
- **Reserved**: Đã được phân bổ cho đơn hàng
- **In-transit**: Đang vận chuyển giữa các kho

### Kiểm tra Tồn kho theo Sản phẩm

1. Inventory > Item Stock
2. Tìm sản phẩm
3. Xem tồn kho tất cả các kho
4. Xem lịch sử nhập/xuất
5. Xem dự báo tồn kho

## Tạo Phiếu Nhập Kho (Receive Ticket)

### Nguồn Nhập kho

- **Purchase Order**: Nhập từ nhà cung cấp
- **Manufacture Order**: Nhập thành phẩm từ sản xuất
- **Transfer**: Nhận từ kho khác
- **Return**: Khách trả hàng
- **Adjustment**: Điều chỉnh tồn kho
- **Initial Stock**: Nhập tồn kho đầu kỳ

### Quy trình Nhập kho

**Bước 1:** Vào Inventory > Receive Ticket > Create New

**Bước 2:** Điền thông tin:

- Kho nhập
- Nguồn (PO, MO, Transfer, etc.)
- Sản phẩm và số lượng
- Batch/Lot number (nếu có)
- Serial numbers (nếu có)
- Expiry date (nếu có)
- Location trong kho
- Ghi chú

**Bước 3:** Kiểm tra hàng hóa:

- Đối chiếu với chứng từ
- Kiểm tra số lượng
- Kiểm tra chất lượng
- Chụp ảnh (nếu cần)

**Bước 4:** Submit và chờ phê duyệt

**Bước 5:** Sau khi approve, hàng được cập nhật vào tồn kho

### Xử lý Sai lệch

- **Thiếu hàng**: Tạo Partial Receipt, đợi giao tiếp
- **Thừa hàng**: Liên hệ nhà cung cấp
- **Hàng lỗi**: Từ chối nhận, tạo Return
- **Sai sản phẩm**: Liên hệ ngay, không nhập kho

## Tạo Phiếu Xuất Kho (Issue Ticket)

### Lý do Xuất kho

- **Sales Order**: Xuất hàng cho khách
- **Manufacture Order**: Xuất nguyên vật liệu sản xuất
- **Transfer**: Chuyển sang kho khác
- **Scrap**: Hàng hỏng, thanh lý
- **Sample**: Xuất mẫu
- **Internal Use**: Sử dụng nội bộ

### Quy trình Xuất kho

**Bước 1:** Vào Inventory > Issue Ticket > Create New

**Bước 2:** Điền thông tin:

- Kho xuất
- Lý do xuất
- Sản phẩm và số lượng
- Batch/Serial (nếu có)
- Người nhận
- Địa chỉ giao hàng (nếu có)
- Ghi chú

**Bước 3:** Kiểm tra tồn kho:

- Đủ số lượng không?
- Đúng batch/serial không?
- Còn hạn sử dụng không?

**Bước 4:** Submit và chờ phê duyệt

**Bước 5:** Sau approve:

- Chuẩn bị hàng
- Đóng gói
- Giao hàng
- Cập nhật trạng thái

### FIFO/FEFO/LIFO

**FIFO (First In First Out):**

- Hàng nhập trước xuất trước
- Phù hợp với hàng không có hạn sử dụng

**FEFO (First Expired First Out):**

- Hàng hết hạn sớm xuất trước
- Bắt buộc với thực phẩm, dược phẩm

**LIFO (Last In First Out):**

- Hàng nhập sau xuất trước
- Ít dùng trong thực tế

## Chuyển Kho (Transfer Ticket)

### Khi nào cần Chuyển kho?

- Cân bằng tồn kho giữa các kho
- Gần khách hàng hơn
- Kho nguồn hết chỗ
- Tối ưu chi phí vận chuyển

### Quy trình Chuyển kho

**Bước 1:** Vào Inventory > Transfer Ticket > Create

**Bước 2:** Điền thông tin:

- Kho nguồn
- Kho đích
- Sản phẩm và số lượng
- Lý do chuyển
- Ngày chuyển dự kiến
- Phương thức vận chuyển

**Bước 3:** Submit và approve

**Bước 4:** Xuất kho nguồn

**Bước 5:** Vận chuyển

**Bước 6:** Nhập kho đích

**Bước 7:** Hoàn thành

### Tracking Chuyển kho

- Trạng thái: Draft → Approved → In-transit → Received
- Có thể track vị trí hàng
- Cập nhật ETA
- Thông báo khi đến kho đích

## Kiểm kê Tồn kho (Stock Count)

### Loại Kiểm kê

**Kiểm kê định kỳ:**

- Hàng tháng/quý/năm
- Kiểm kê toàn bộ kho
- Đóng cửa kho trong thời gian kiểm kê

**Kiểm kê luân chuyển (Cycle Count):**

- Kiểm kê từng phần
- Không cần đóng cửa kho
- Sản phẩm A: kiểm hàng tháng
- Sản phẩm B: kiểm hàng quý
- Sản phẩm C: kiểm hàng năm

### Quy trình Kiểm kê

**Bước 1:** Tạo Stock Count

- Chọn kho
- Chọn sản phẩm (hoặc tất cả)
- Chọn ngày kiểm kê

**Bước 2:** In phiếu kiểm kê

**Bước 3:** Đếm thực tế

- Đếm từng sản phẩm
- Ghi số lượng
- Ghi batch/serial

**Bước 4:** Nhập vào hệ thống

**Bước 5:** So sánh với sổ sách

- Số lượng khớp: OK
- Chênh lệch: Điều tra nguyên nhân

**Bước 6:** Điều chỉnh tồn kho

- Tạo Adjustment Ticket
- Ghi rõ lý do
- Approve

## Điều chỉnh Tồn kho (Adjustment)

### Lý do Điều chỉnh

- Chênh lệch kiểm kê
- Hàng hỏng
- Hàng mất
- Hàng hết hạn
- Sai sót nhập liệu

### Quy trình Điều chỉnh

1. Inventory > Adjustment > Create
2. Chọn kho
3. Chọn sản phẩm
4. Nhập số lượng điều chỉnh (+/-)
5. Chọn lý do
6. Ghi chú chi tiết
7. Attach evidence (ảnh, biên bản)
8. Submit và chờ approve

**Lưu ý:**

- Adjustment cần approval từ Manager
- Phải có lý do rõ ràng
- Lưu trữ chứng từ

## Cảnh báo Tồn kho

### Minimum Stock Level

**Cài đặt:**

- Mỗi sản phẩm có minimum level
- Khi tồn kho < minimum → Alert
- Gửi notification cho Purchasing

**Tính toán:**

```
Minimum Stock = (Average Daily Usage × Lead Time) + Safety Stock
```

### Maximum Stock Level

**Mục đích:**

- Tránh tồn kho quá nhiều
- Giảm chi phí lưu kho
- Tránh hàng ứ đọng

### Reorder Point

**Khi nào đặt hàng:**

```
Reorder Point = (Average Daily Usage × Lead Time) + Safety Stock
```

**Số lượng đặt:**

```
Order Quantity = Maximum Stock - Current Stock
```

## Báo cáo Tồn kho

### Báo cáo Nhập/Xuất/Tồn

**Nội dung:**

- Tồn đầu kỳ
- Nhập trong kỳ (chi tiết theo nguồn)
- Xuất trong kỳ (chi tiết theo lý do)
- Tồn cuối kỳ

**Công thức:**

```
Tồn cuối = Tồn đầu + Nhập - Xuất
```

### Báo cáo Inventory Aging

**Phân loại hàng tồn:**

- 0-30 ngày: Mới
- 31-60 ngày: Bình thường
- 61-90 ngày: Cần chú ý
- 91-180 ngày: Chậm
- > 180 ngày: Ứ đọng

**Hành động:**

- Hàng ứ đọng: Giảm giá, thanh lý
- Hàng chậm: Khuyến mãi
- Hàng mới: Theo dõi

### Báo cáo Stock Movement

**Nội dung:**

- Lịch sử nhập/xuất
- Frequency
- Average quantity
- Trend analysis

### Báo cáo Inventory Valuation

**Phương pháp:**

- **FIFO**: First In First Out
- **Average Cost**: Giá trung bình
- **Standard Cost**: Giá chuẩn

**Nội dung:**

- Giá trị tồn kho
- Theo sản phẩm
- Theo kho
- Theo loại

## Tips & Best Practices

### Tổ chức Kho

- Sắp xếp theo loại sản phẩm
- Dán nhãn rõ ràng
- Sử dụng barcode/QR code
- Khu vực riêng cho hàng lỗi
- Khu vực kiểm tra chất lượng

### Quản lý Tồn kho

- Kiểm kê định kỳ
- FIFO/FEFO
- Minimum/Maximum stock
- ABC analysis
- Slow-moving analysis

### An toàn Kho

- Phòng cháy chữa cháy
- Camera giám sát
- Kiểm soát ra vào
- Bảo hiểm hàng hóa
- Đào tạo nhân viên

### Tối ưu Không gian

- Sử dụng kệ cao
- Sắp xếp khoa học
- Khu vực picking hiệu quả
- Lối đi rộng rãi
- Ánh sáng đầy đủ
