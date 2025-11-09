# Chatbot Client Demo

Giao diện web đơn giản để test chatbot service với WebSocket real-time.

## 🚀 Cách sử dụng

### 1. Khởi động Chatbot Service

Trước tiên, đảm bảo chatbot-service đang chạy:

```bash
cd chatbot-service
npm install
npm run start:dev
```

Service sẽ chạy ở: `http://localhost:3006`

### 2. Mở giao diện demo

Chỉ cần mở file `index.html` bằng trình duyệt:

```bash
# Cách 1: Double click vào file index.html

# Cách 2: Mở bằng Live Server trong VS Code
# Click phải vào index.html -> Open with Live Server
```

### 3. Test chatbot

Giao diện sẽ tự động kết nối đến chatbot service. Bạn có thể:

- **Gõ câu hỏi** trực tiếp vào ô input
- **Click vào suggestions** để test nhanh
- **Xem status** kết nối ở phía trên
- **Xóa lịch sử** bằng nút "Xóa"

## 📝 Câu hỏi mẫu để test

### 1. Kiểm tra tồn kho
```
Tồn kho item I000100001 ở kho Hà Nội còn bao nhiêu?
```

### 2. Xem trạng thái đơn hàng
```
Đơn hàng PO-2024-001 đang ở trạng thái gì?
```

### 3. Danh sách kho
```
Cho tôi xem danh sách kho hàng
```

### 4. Tìm mặt hàng
```
Tìm mặt hàng I000100001
```

### 5. Tạo đơn mua (sẽ lỗi nếu không có quotation)
```
Tạo đơn mua hàng 100 units item I000100001
```

### 6. Trò chuyện chung
```
Xin chào!
Bạn có thể làm gì?
Hướng dẫn tôi sử dụng hệ thống
```

## ⚙️ Cấu hình

Bạn có thể thay đổi cấu hình trong phần "⚙️ Cấu hình" ở cuối trang:

- **WebSocket URL**: URL của chatbot service (mặc định: `http://localhost:3006`)
- **User ID**: ID người dùng (mặc định: `1`)
- **Company ID**: ID công ty (mặc định: `1`)
- **Session ID**: ID phiên chat (mặc định: `session-demo-001`)

Sau khi thay đổi, click "Kết nối lại" để áp dụng.

## 🎯 Tính năng

- ✅ Real-time chat với WebSocket
- ✅ Typing indicator (hiển thị bot đang trả lời)
- ✅ Hiển thị trạng thái kết nối
- ✅ Lưu lịch sử chat
- ✅ Xóa lịch sử
- ✅ Suggestions để test nhanh
- ✅ Responsive design
- ✅ Hiển thị intent được nhận diện

## 🔧 Troubleshooting

### Không kết nối được?

1. Kiểm tra chatbot-service có đang chạy không:
   ```bash
   # Trong terminal
   curl http://localhost:3006/api/v1/chat/health
   ```

2. Kiểm tra CORS trong chatbot-service đã enable chưa:
   ```typescript
   // Trong main.ts
   app.enableCors({
     origin: '*',
     credentials: true,
   });
   ```

3. Kiểm tra WebSocket URL trong config panel

### Bot không trả lời?

1. Kiểm tra OpenAI API key đã cấu hình chưa
2. Kiểm tra RabbitMQ đã chạy chưa (nếu cần gọi các service khác)
3. Xem console log trong Developer Tools (F12)

## 📦 Files

```
chatbot-client-demo/
├── index.html      # Giao diện HTML
├── style.css       # Styling
├── script.js       # Logic JavaScript + Socket.IO
└── README.md       # Hướng dẫn này
```

## 🌐 Không cần build hay install

Giao diện này sử dụng:
- HTML/CSS/JavaScript thuần
- Socket.IO từ CDN

Không cần npm install hay build gì cả, chỉ cần mở file HTML!

## 💡 Tips

- Thử các câu hỏi khác nhau để test khả năng hiểu ngôn ngữ tự nhiên
- Xem console log để debug
- Intent được hiển thị dưới mỗi câu trả lời của bot
- Session ID giúp lưu ngữ cảnh hội thoại

Enjoy testing! 🚀
