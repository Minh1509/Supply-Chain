from openpyxl import Workbook

wb = Workbook()

# =========================
# SHEET 1: ITEM MASTER
# =========================
ws_items = wb.active
ws_items.title = "Items"

ws_items.append([
    "Tên hàng hóa",
    "Loại hàng hóa",
    "Đơn vị tính",
    "Hàng bán",
    "Thông số kỹ thuật",
    "Mô tả"
])

items_data = [
    [
        "Laptop Samsung Galaxy Book 15",
        "Thành phẩm",
        "Chiếc",
        True,
        "Màn hình 15.6 inch FHD, CPU Intel Core, pin 54Wh, SSD, Windows",
        "Laptop Samsung phục vụ học tập, văn phòng, thiết kế mỏng nhẹ"
    ],
    [
        "Màn hình Laptop 15.6 inch",
        "Bán thành phẩm",
        "Bộ",
        True,
        "Màn hình IPS 15.6 inch, độ phân giải Full HD",
        "Màn hình hiển thị chính của laptop"
    ],
    [
        "Main Board Laptop Samsung",
        "Bán thành phẩm",
        "Bộ",
        True,
        "Bo mạch tích hợp CPU, chipset, cổng kết nối",
        "Bo mạch điều khiển trung tâm của laptop"
    ],
    [
        "Pin Lithium Laptop",
        "Bán thành phẩm",
        "Bộ",
        True,
        "Pin lithium dung lượng 54Wh",
        "Cung cấp năng lượng cho laptop"
    ],
    [
        "Bàn phím Laptop",
        "Nguyên vật liệu",
        "Bộ",
        True,
        "Bàn phím chiclet, layout tiêu chuẩn",
        "Thiết bị nhập liệu cho laptop"
    ],
    [
        "Touchpad Laptop",
        "Nguyên vật liệu",
        "Cái",
        True,
        "Touchpad đa điểm",
        "Thiết bị điều khiển chuột cảm ứng"
    ],
    [
        "Vỏ nhôm Laptop",
        "Nguyên vật liệu",
        "Bộ",
        True,
        "Vỏ nhôm hợp kim, tản nhiệt tốt",
        "Khung vỏ bảo vệ linh kiện laptop"
    ],
]

for row in items_data:
    ws_items.append(row)

file_path = "Laptop_Samsung_SCM_Data.xlsx"
wb.save(file_path)

print("Đã tạo file:", file_path)