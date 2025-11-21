# Hướng dẫn Sử dụng Chatbot

## Giới thiệu

Chatbot SCMS là trợ lý ảo thông minh giúp bạn:

- Tra cứu thông tin nhanh chóng
- Tạo phiếu nhập/xuất kho
- Kiểm tra đơn hàng
- Xem báo cáo
- Trả lời câu hỏi về hệ thống

## Cách Hỏi Chatbot

### Nguyên tắc Cơ bản

1. **Hỏi rõ ràng, cụ thể**
   - ❌ Tồn kho?
   - ✅ Tồn kho sản phẩm 123 ở kho 1 là bao nhiêu?

2. **Cung cấp đủ thông tin**
   - Mã sản phẩm / tên sản phẩm
   - Mã kho / tên kho
   - Mã đơn hàng
   - Thời gian (nếu cần)

3. **Sử dụng ngôn ngữ tự nhiên**
   - Không cần format đặc biệt
   - Có thể dùng tiếng Việt hoặc tiếng Anh
   - Chatbot hiểu cả viết tắt

## Các Tính năng Chính

### 1. Kiểm tra Tồn kho

**Câu hỏi mẫu:**

```
- Tồn kho sản phẩm 123 là bao nhiêu?
- Kiểm tra tồn kho item 456 ở kho 1
- Còn bao nhiêu sản phẩm ABC trong kho?
- Xem tồn kho tất cả sản phẩm ở kho Hà Nội
```

**Thông tin cần:**

- Mã sản phẩm hoặc tên sản phẩm
- Mã kho (optional - nếu không có sẽ show tất cả kho)

**Kết quả:**

- Số lượng tồn kho
- Số lượng available (có thể xuất)
- Số lượng on-demand (đã đặt trước)

### 2. Kiểm tra Đơn hàng

**Sales Order:**

```
- Kiểm tra đơn hàng SO-001
- Trạng thái đơn bán hàng 123
- Đơn hàng của khách ABC đến đâu rồi?
```

**Purchase Order:**

```
- Kiểm tra đơn mua hàng PO-001
- Trạng thái đơn mua 456
- Khi nào nhận được hàng từ nhà cung cấp XYZ?
```

**Manufacture Order:**

```
- Kiểm tra lệnh sản xuất MO-001
- Tiến độ sản xuất đơn 789
- Khi nào hoàn thành sản xuất?
```

**Thông tin cần:**

- Mã đơn hàng hoặc ID đơn hàng

**Kết quả:**

- Trạng thái đơn hàng
- Thông tin chi tiết
- Ngày tạo, ngày dự kiến hoàn thành
- Danh sách sản phẩm

### 3. Tạo Phiếu Nhập/Xuất kho

**Tạo Phiếu Xuất:**

```
- Tạo phiếu xuất kho sản phẩm 123, số lượng 50, từ kho 1
- Xuất 100 cái item 456 từ kho Hà Nội
- Cần xuất hàng cho đơn SO-001
```

**Tạo Phiếu Nhập:**

```
- Tạo phiếu nhập kho sản phẩm 123, số lượng 100, vào kho 1
- Nhập 200 cái item 456 vào kho Hà Nội
- Nhập hàng từ đơn PO-001
```

**Thông tin cần:**

- Mã sản phẩm
- Số lượng
- Mã kho
- Lý do (optional)

**Kết quả:**

- Mã phiếu được tạo
- Trạng thái
- Thông báo thành công/thất bại

### 4. Xem Báo cáo

**Báo cáo Tồn kho:**

```
- Báo cáo tồn kho tháng này
- Xem báo cáo nhập xuất tồn tháng 11
- Tổng hợp tồn kho tất cả kho
```

**Báo cáo Bán hàng:**

```
- Báo cáo doanh thu tháng này
- Xem báo cáo bán hàng tháng 11
- Top sản phẩm bán chạy
```

**Báo cáo Mua hàng:**

```
- Báo cáo chi phí mua hàng tháng này
- Xem báo cáo mua hàng tháng 11
- Tổng chi phí mua nguyên vật liệu
```

**Báo cáo Sản xuất:**

```
- Báo cáo sản xuất tháng này
- Xem tiến độ sản xuất
- Số lượng sản phẩm đã hoàn thành
```

### 5. Tra cứu Thông tin

**Sản phẩm:**

```
- Thông tin sản phẩm 123
- Giá sản phẩm ABC là bao nhiêu?
- Sản phẩm XYZ thuộc loại gì?
```

**Kho:**

```
- Danh sách kho của công ty
- Kho nào gần khách hàng ABC nhất?
- Địa chỉ kho Hà Nội
```

**Nhà cung cấp:**

```
- Thông tin nhà cung cấp ABC
- Liên hệ nhà cung cấp XYZ
- Đánh giá nhà cung cấp DEF
```

## Ví dụ Hội thoại

### Scenario 1: Kiểm tra và Xuất kho

**User:** Xin chào

**Bot:** Xin chào! Tôi là trợ lý ảo SCMS. Tôi có thể giúp gì cho bạn?

**User:** Tồn kho sản phẩm 123 ở kho 1 là bao nhiêu?

**Bot:** Tồn kho sản phẩm 123 tại kho 1:

- Tổng số lượng: 150 cái
- Available: 130 cái
- On-demand: 20 cái

Bạn cần làm gì tiếp theo?

**User:** Tạo phiếu xuất 50 cái

**Bot:** Đã tạo phiếu xuất kho thành công!

- Mã phiếu: ISSUE-001
- Sản phẩm: 123
- Số lượng: 50
- Kho: 1
- Trạng thái: Chờ duyệt

Còn gì tôi có thể giúp không?

### Scenario 2: Kiểm tra Đơn hàng

**User:** Kiểm tra đơn hàng SO-001

**Bot:** Thông tin đơn hàng SO-001:

- Trạng thái: Processing
- Khách hàng: Công ty ABC
- Tổng tiền: 50,000,000 VNĐ
- Ngày tạo: 15/11/2025
- Dự kiến giao: 20/11/2025

Sản phẩm:

1. Item 123 - Số lượng: 100
2. Item 456 - Số lượng: 50

Bạn muốn biết thêm gì không?

### Scenario 3: Xem Báo cáo

**User:** Báo cáo doanh thu tháng này

**Bot:** Báo cáo doanh thu tháng 11/2025:

- Tổng doanh thu: 500,000,000 VNĐ
- Số đơn hàng: 45
- Giá trị trung bình: 11,111,111 VNĐ
- Tăng trưởng: +15% so với tháng trước

Top 3 sản phẩm:

1. Item 123 - 100,000,000 VNĐ
2. Item 456 - 80,000,000 VNĐ
3. Item 789 - 60,000,000 VNĐ

Bạn muốn xem chi tiết hơn không?

## Tips & Tricks

### Hỏi Hiệu quả

1. **Cung cấp context**
   - Nói rõ bạn đang làm gì
   - Cung cấp thông tin liên quan

2. **Hỏi từng bước**
   - Không hỏi quá nhiều cùng lúc
   - Đợi chatbot trả lời xong mới hỏi tiếp

3. **Sử dụng mã code**
   - Dùng mã sản phẩm, mã kho chính xác
   - Tránh dùng tên gọi không chính thức

### Xử lý Lỗi

**Chatbot không hiểu:**

```
User: abc xyz
Bot: Xin lỗi, tôi không hiểu câu hỏi của bạn.
     Bạn có thể hỏi rõ hơn được không?

     Ví dụ:
     - Tồn kho sản phẩm 123 là bao nhiêu?
     - Kiểm tra đơn hàng SO-001
     - Báo cáo doanh thu tháng này
```

**Thiếu thông tin:**

```
User: Tồn kho là bao nhiêu?
Bot: Bạn muốn kiểm tra tồn kho sản phẩm nào?
     Vui lòng cung cấp mã sản phẩm hoặc tên sản phẩm.
```

**Không tìm thấy:**

```
User: Kiểm tra đơn hàng SO-999
Bot: Không tìm thấy đơn hàng SO-999.
     Vui lòng kiểm tra lại mã đơn hàng.
```

### Shortcuts

**Lệnh nhanh:**

- `help` - Xem hướng dẫn
- `menu` - Xem menu chức năng
- `history` - Xem lịch sử hội thoại
- `clear` - Xóa lịch sử

**Từ khóa:**

- `tồn kho` → Kiểm tra inventory
- `đơn hàng` → Kiểm tra orders
- `báo cáo` → Xem reports
- `tạo phiếu` → Tạo tickets

## Personalization

### Cài đặt Cá nhân

**Ngôn ngữ:**

```
User: Đổi sang tiếng Anh
Bot: Language changed to English
```

**Kho mặc định:**

```
User: Set kho mặc định là kho 1
Bot: Đã cài đặt kho mặc định: Kho 1
```

**Sản phẩm yêu thích:**

```
User: Thêm sản phẩm 123 vào yêu thích
Bot: Đã thêm sản phẩm 123 vào danh sách yêu thích
```

### Lịch sử Hội thoại

Chatbot nhớ context trong phiên làm việc:

```
User: Tồn kho sản phẩm 123?
Bot: Tồn kho: 150 cái

User: Ở kho 2 thì sao?
Bot: Tồn kho sản phẩm 123 ở kho 2: 80 cái
     (Chatbot nhớ bạn đang hỏi về sản phẩm 123)
```

## Giới hạn

### Chatbot KHÔNG thể:

- ❌ Approve đơn hàng (cần Manager)
- ❌ Xóa dữ liệu
- ❌ Thay đổi giá sản phẩm
- ❌ Thay đổi quyền user
- ❌ Backup/Restore hệ thống

### Chatbot CÓ THỂ:

- ✅ Tra cứu thông tin
- ✅ Tạo phiếu nhập/xuất (chờ approve)
- ✅ Xem báo cáo
- ✅ Trả lời câu hỏi
- ✅ Hướng dẫn sử dụng

## Troubleshooting

### Chatbot phản hồi chậm

**Nguyên nhân:**

- Hệ thống đang xử lý request phức tạp
- Kết nối mạng chậm
- Server đang bận

**Giải pháp:**

- Đợi thêm vài giây
- Refresh trang
- Thử lại sau

### Chatbot trả lời sai

**Nguyên nhân:**

- Câu hỏi không rõ ràng
- Thiếu thông tin
- Dữ liệu trong hệ thống chưa cập nhật

**Giải pháp:**

- Hỏi lại rõ ràng hơn
- Cung cấp đầy đủ thông tin
- Kiểm tra trực tiếp trong hệ thống

### Không kết nối được

**Nguyên nhân:**

- Mất kết nối internet
- Server maintenance
- Session timeout

**Giải pháp:**

- Kiểm tra internet
- Refresh trang
- Login lại
- Liên hệ IT support

## FAQ về Chatbot

**Q: Chatbot có thể làm gì?**
A: Chatbot có thể tra cứu thông tin, tạo phiếu nhập/xuất, kiểm tra đơn hàng, xem báo cáo và trả lời câu hỏi về hệ thống.

**Q: Chatbot có hiểu tiếng Việt không?**
A: Có, chatbot hiểu cả tiếng Việt và tiếng Anh.

**Q: Chatbot có nhớ hội thoại trước không?**
A: Có, chatbot nhớ context trong phiên làm việc hiện tại.

**Q: Tôi có thể hỏi chatbot bất cứ lúc nào?**
A: Có, chatbot hoạt động 24/7.

**Q: Chatbot có thể approve đơn hàng không?**
A: Không, chỉ Manager mới có quyền approve.

**Q: Làm sao để chatbot hiểu tôi hơn?**
A: Hỏi rõ ràng, cụ thể, cung cấp đủ thông tin (mã sản phẩm, mã kho, v.v.)

**Q: Chatbot có thể tạo báo cáo tùy chỉnh không?**
A: Hiện tại chưa, bạn cần vào module Reports để tạo custom report.

**Q: Dữ liệu chatbot lấy từ đâu?**
A: Chatbot lấy dữ liệu real-time từ hệ thống SCMS.

**Q: Chatbot có lưu lịch sử hội thoại không?**
A: Có, để phục vụ analytics và cải thiện chatbot.

**Q: Tôi có thể feedback về chatbot ở đâu?**
A: Liên hệ IT support hoặc gửi feedback qua Settings > Feedback.

## Liên hệ Hỗ trợ

**Nếu cần hỗ trợ:**

- Email: support@company.com
- Phone: 1900-xxxx
- Chat: IT Support channel

**Báo lỗi:**

- Mô tả chi tiết vấn đề
- Chụp screenshot
- Ghi lại câu hỏi và câu trả lời
- Gửi qua email hoặc ticket system

---

**Happy chatting!** 🤖💬
