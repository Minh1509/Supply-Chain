# Hướng dẫn Quản lý Sản xuất

## Tạo Lệnh Sản xuất (Manufacture Order)

**Điều kiện:**
- Có Sales Order đã được duyệt
- Có BOM (Bill of Materials) cho sản phẩm
- Đủ nguyên vật liệu trong kho

**Các bước:**

1. Vào Operation > Manufacture Order > Create
2. Chọn sản phẩm cần sản xuất
3. Nhập số lượng
4. Hệ thống tự động tính nguyên vật liệu cần thiết từ BOM
5. Kiểm tra tồn kho nguyên vật liệu
6. Chọn dây chuyền sản xuất (Manufacture Line)
7. Chọn nhà máy (Manufacture Plant)
8. Đặt ngày bắt đầu và deadline
9. Submit

## Quy trình Sản xuất (Manufacture Process)

Mỗi lệnh sản xuất có các giai đoạn (Stages):
1. **Preparation**: Chuẩn bị nguyên vật liệu
2. **Processing**: Gia công
3. **Assembly**: Lắp ráp
4. **Quality Check**: Kiểm tra chất lượng
5. **Packaging**: Đóng gói
6. **Completed**: Hoàn thành

## BOM (Bill of Materials)

Định mức nguyên vật liệu cho 1 sản phẩm:
- Danh sách nguyên vật liệu
- Số lượng cần thiết
- Đơn vị tính

**Ví dụ:** Sản xuất 1 chiếc bàn cần:
- 4 chân bàn
- 1 mặt bàn
- 16 ốc vít
- 1 lít sơn

## Delivery Order

Sau khi sản xuất xong, tạo Delivery Order để giao hàng:
- Liên kết với Sales Order
- Chọn sản phẩm đã hoàn thành
- Thông tin giao hàng
- Địa chỉ khách hàng
