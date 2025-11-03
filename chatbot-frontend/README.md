# Chatbot Frontend - Test Interface

## 📝 Mô tả

Giao diện web đơn giản để test chatbot-service. Hỗ trợ cả WebSocket và REST API.

## ✨ Tính năng

- 💬 Chat real-time với WebSocket hoặc REST API
- 🎨 Giao diện đẹp, responsive
- 📊 Thống kê tin nhắn
- 🔄 Quản lý session
- 🗑️ Xóa lịch sử chat
- ⚙️ Cài đặt linh hoạt

## 🚀 Cách sử dụng

### 1. Chạy Chatbot Service

Trước tiên, đảm bảo chatbot-service đã chạy:

```bash
cd ../chatbot-service
npm run start:dev
```

Service sẽ chạy tại: `http://localhost:3006`

### 2. Mở Frontend

**Cách 1: Mở trực tiếp file HTML**

```bash
# Mở index.html bằng trình duyệt
start index.html
```

**Cách 2: Dùng Live Server (VSCode)**

- Cài extension "Live Server"
- Click chuột phải vào `index.html` → "Open with Live Server"

**Cách 3: Dùng Python HTTP Server**

```bash
# Python 3
python -m http.server 8080

# Sau đó mở http://localhost:8080
```

**Cách 4: Dùng Node.js HTTP Server**

```bash
# Cài đặt http-server
npm install -g http-server

# Chạy server
http-server -p 8080

# Mở http://localhost:8080
```

## 🎯 Hướng dẫn Test

### Test WebSocket (Mặc định)

1. Mở frontend
2. Đảm bảo checkbox "Sử dụng WebSocket" được chọn
3. Kiểm tra status: "Đã kết nối (WebSocket)"
4. Gửi tin nhắn và nhận phản hồi real-time

### Test REST API

1. Bỏ chọn checkbox "Sử dụng WebSocket"
2. Kiểm tra status: "Đã kết nối (REST API)"
3. Gửi tin nhắn qua HTTP POST request

### Test Quick Actions

Click vào các nút:

- 📦 Kiểm tra tồn kho
- 🛒 Tạo đơn hàng
- 👥 Nhà cung cấp
- 📊 Báo cáo

### Test Session Management

- Click "Tạo Session Mới" để tạo session mới
- Click nút 🗑️ để xóa lịch sử chat

## ⚙️ Cấu hình

### API URL

Mặc định: `http://localhost:3006`

Nếu chatbot-service chạy ở port khác:

```
http://localhost:PORT
```

### Session ID

Tự động tạo khi load trang. Format:

```
session_[timestamp]_[random]
```

## 🧪 Các trường hợp test

### 1. Test kết nối

```
- Mở frontend
- Kiểm tra status dot (màu xanh = OK, đỏ = Error)
- Kiểm tra "Thống kê" → Kết nối
```

### 2. Test gửi tin nhắn

```
- Gõ: "Xin chào"
- Kiểm tra tin nhắn hiển thị bên phải (user)
- Kiểm tra bot phản hồi bên trái
- Kiểm tra typing indicator (3 dots)
```

### 3. Test intent recognition

```
- "Kiểm tra tồn kho sản phẩm ABC123"
- "Tạo đơn hàng mới"
- "Xem danh sách nhà cung cấp"
- "Báo cáo doanh số tuần này"
```

### 4. Test lịch sử chat

```
- Gửi vài tin nhắn
- Refresh trang
- Lịch sử sẽ được load lại
```

### 5. Test clear chat

```
- Click nút 🗑️
- Confirm xóa
- Kiểm tra messages đã xóa
- Thống kê reset về 0
```

## 🐛 Troubleshooting

### Lỗi: "Mất kết nối"

**Nguyên nhân:**

- Chatbot-service chưa chạy
- Sai port hoặc URL
- CORS bị block

**Giải pháp:**

```bash
# 1. Kiểm tra service đang chạy
cd chatbot-service
npm run start:dev

# 2. Kiểm tra port trong console
# Should see: chatbot-service is running on PORT: 3006

# 3. Kiểm tra API URL trong frontend
# Đảm bảo match với port của service
```

### Lỗi: "Failed to send message"

**Nguyên nhân:**

- Service lỗi
- Sai endpoint URL
- Network error

**Giải pháp:**

- Mở DevTools Console (F12)
- Xem lỗi chi tiết
- Kiểm tra Network tab
- Test trực tiếp API với curl:

```bash
curl -X POST http://localhost:3006/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"test\",\"message\":\"hello\"}"
```

### Lỗi: WebSocket connection failed

**Giải pháp:**

- Chuyển sang REST API (bỏ chọn WebSocket checkbox)
- Hoặc kiểm tra Socket.IO đang hoạt động:

```bash
# Trong chatbot-service logs
# Should see: WebSocket available at ws://localhost:3006/chat
```

## 📱 Responsive Design

Frontend responsive trên mọi thiết bị:

- 💻 Desktop: 2 cột (chat + settings)
- 📱 Mobile: 1 cột (chat trên, settings dưới)

## 🎨 Tùy chỉnh

### Thay đổi màu sắc

Edit `style.css`:

```css
/* Gradient background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* User message color */
.user-message .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Thay đổi emoji avatar

Edit `index.html`:

```html
<!-- Bot icon -->
<div class="bot-icon">🤖</div>

<!-- User icon in JavaScript -->
avatar.textContent = sender === 'user' ? '👤' : '🤖';
```

## 📦 Files

```
chatbot-frontend/
├── index.html    # HTML structure
├── style.css     # Styling
├── app.js        # JavaScript logic
└── README.md     # This file
```

## 🔗 API Endpoints (Reference)

**REST API:**

```
POST   /api/v1/chat/message        - Gửi tin nhắn
GET    /api/v1/chat/history/:id    - Lấy lịch sử
DELETE /api/v1/chat/history/:id    - Xóa lịch sử
GET    /api/v1/chat/health         - Health check
```

**WebSocket Events:**

```
emit:   message         - Gửi tin nhắn
emit:   typing          - Đang gõ
emit:   get_history     - Lấy lịch sử
emit:   clear_history   - Xóa lịch sử

on:     message         - Nhận tin nhắn
on:     error           - Nhận lỗi
```

## 🚀 Production

Để deploy production:

1. Build chatbot-service
2. Deploy files HTML/CSS/JS lên web server
3. Update API URL trong frontend
4. Enable HTTPS cho WebSocket

## 📄 License

MIT
