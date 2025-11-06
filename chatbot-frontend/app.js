const API_URL = 'http://localhost:3006';
let socket;
let sessionId = generateSessionId();
let isConnected = false;

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function initSocket() {
    socket = io(API_URL, {
        path: '/chat',
        query: { sessionId }
    });

    socket.on('connect', () => {
        isConnected = true;
        updateStatus('Đã kết nối');
        document.getElementById('btn-send').disabled = false;
    });

    socket.on('disconnect', () => {
        isConnected = false;
        updateStatus('Đã ngắt kết nối');
        document.getElementById('btn-send').disabled = true;
    });

    socket.on('message', (data) => {
        hideTyping();
        addMessage(data.message, 'bot');
    });

    socket.on('typing', () => {
        showTyping();
    });
}

function updateStatus(status) {
    document.getElementById('status').textContent = status;
}

function addMessage(text, sender) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${text}
        </div>
    `;
    
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
    document.getElementById('typing').classList.add('active');
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

function hideTyping() {
    document.getElementById('typing').classList.remove('active');
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message || !isConnected) return;
    
    addMessage(message, 'user');
    input.value = '';
    showTyping();
    
    socket.emit('message', { message });
}

function sendQuick(text) {
    document.getElementById('message-input').value = text;
    sendMessage();
}

function clearChat() {
    document.getElementById('messages').innerHTML = `
        <div class="message bot">
            <div class="message-content">
                Xin chào! Tôi có thể giúp bạn với các vấn đề về quản lý chuỗi cung ứng.
                Hãy hỏi bất kỳ điều gì về tồn kho, đơn hàng, nhà cung cấp...
            </div>
        </div>
    `;
}

document.getElementById('btn-send').addEventListener('click', sendMessage);
document.getElementById('btn-clear').addEventListener('click', clearChat);
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

document.getElementById('message-input').addEventListener('input', (e) => {
    document.getElementById('btn-send').disabled = !e.target.value.trim() || !isConnected;
});

// Thêm xử lý cho mọi câu hỏi
function handleAnyQuestion(message) {
    // Kiểm tra nếu là câu chào
    const greetings = ['xin chào', 'hello', 'hi', 'chào', 'hey'];
    const thanks = ['cảm ơn', 'thank', 'cam on', 'thanks'];
    
    const lowerMessage = message.toLowerCase();
    
    if (greetings.some(g => lowerMessage.includes(g))) {
        return 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?';
    }
    
    if (thanks.some(t => lowerMessage.includes(t))) {
        return 'Không có gì! Nếu cần thêm thông tin gì, bạn cứ hỏi nhé.';
    }
    
    return null; // Để chatbot service xử lý
}

initSocket();
