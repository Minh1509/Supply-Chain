// Chatbot Client Demo
class ChatbotClient {
    constructor() {
        this.socket = null;
        this.sessionId = document.getElementById('sessionId').value;
        this.userId = parseInt(document.getElementById('userId').value);
        this.companyId = parseInt(document.getElementById('companyId').value);
        
        this.initElements();
        this.attachEventListeners();
        this.connect();
    }

    initElements() {
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.getElementById('clearButton');
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.reconnectButton = document.getElementById('reconnectButton');
    }

    attachEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Clear chat history
        this.clearButton.addEventListener('click', () => this.clearChat());

        // Reconnect button
        this.reconnectButton.addEventListener('click', () => {
            this.sessionId = document.getElementById('sessionId').value;
            this.userId = parseInt(document.getElementById('userId').value);
            this.companyId = parseInt(document.getElementById('companyId').value);
            this.connect();
        });

        // Suggestion chips
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const message = chip.getAttribute('data-message');
                this.messageInput.value = message;
                this.sendMessage();
            });
        });
    }

    connect() {
        const wsUrl = document.getElementById('wsUrl').value;
        
        this.updateStatus('Đang kết nối...', false);

        try {
            // Disconnect if already connected
            if (this.socket) {
                this.socket.disconnect();
            }

            // Connect to chatbot service
            this.socket = io(`${wsUrl}/chat`, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            this.setupSocketListeners();
        } catch (error) {
            console.error('Connection error:', error);
            this.updateStatus('Lỗi kết nối', false);
            this.addSystemMessage('Không thể kết nối đến server. Vui lòng kiểm tra URL và thử lại.');
        }
    }

    setupSocketListeners() {
        // Connected event
        this.socket.on('connected', (data) => {
            console.log('Connected to chatbot:', data);
            this.updateStatus('Đã kết nối', true);
            this.messageInput.disabled = false;
            this.sendButton.disabled = false;
            
            if (data.message) {
                this.addBotMessage(data.message);
            }
        });

        // Receive message
        this.socket.on('message', (data) => {
            console.log('Received message:', data);
            this.typingIndicator.style.display = 'none';
            
            if (data.message) {
                this.addBotMessage(data.message, data);
            }
        });

        // Typing indicator
        this.socket.on('typing', (data) => {
            if (data.isTyping) {
                this.typingIndicator.style.display = 'flex';
            } else {
                this.typingIndicator.style.display = 'none';
            }
        });

        // Error event
        this.socket.on('error', (data) => {
            console.error('Socket error:', data);
            this.typingIndicator.style.display = 'none';
            this.addSystemMessage(`Lỗi: ${data.message || 'Có lỗi xảy ra'}`);
        });

        // Disconnect event
        this.socket.on('disconnect', () => {
            console.log('Disconnected from chatbot');
            this.updateStatus('Mất kết nối', false);
            this.messageInput.disabled = true;
            this.sendButton.disabled = true;
            this.addSystemMessage('Đã ngắt kết nối khỏi server.');
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.updateStatus('Lỗi kết nối', false);
            this.addSystemMessage('Không thể kết nối đến chatbot service. Đảm bảo service đang chạy trên port 3006.');
        });
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || !this.socket || !this.socket.connected) {
            return;
        }

        // Add user message to chat
        this.addUserMessage(message);

        // Send to chatbot
        const payload = {
            message: message,
            sessionId: this.sessionId,
            userId: this.userId,
            companyId: this.companyId,
            metadata: {
                timestamp: new Date().toISOString()
            }
        };

        console.log('Sending message:', payload);
        this.socket.emit('message', payload);

        // Clear input
        this.messageInput.value = '';
        
        // Show typing indicator
        this.typingIndicator.style.display = 'flex';
    }

    addUserMessage(text) {
        const messageDiv = this.createMessageElement('user', text);
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(text, data = null) {
        const messageDiv = this.createMessageElement('bot', text);
        
        // Add additional data if available
        if (data && data.intent) {
            const intentTag = document.createElement('div');
            intentTag.style.cssText = 'font-size: 11px; color: #667eea; margin-top: 8px; padding: 4px 8px; background: #f0f0f0; border-radius: 10px; display: inline-block;';
            intentTag.textContent = `Intent: ${data.intent}`;
            messageDiv.querySelector('.message-content').appendChild(intentTag);
        }
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'system-message';
        messageDiv.style.cssText = 'text-align: center; padding: 10px; color: #999; font-size: 12px; font-style: italic;';
        messageDiv.textContent = text;
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    createMessageElement(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(new Date());

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        return messageDiv;
    }

    clearChat() {
        if (confirm('Bạn có chắc muốn xóa lịch sử chat?')) {
            this.chatContainer.innerHTML = '';
            
            // Emit clear history event
            if (this.socket && this.socket.connected) {
                this.socket.emit('clear_history', { sessionId: this.sessionId });
            }
            
            this.addSystemMessage('Đã xóa lịch sử chat');
        }
    }

    updateStatus(text, connected) {
        this.statusText.textContent = text;
        this.statusIndicator.className = connected ? 'status-indicator status-connected' : 'status-indicator status-disconnected';
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    formatTime(date) {
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Chatbot Client Demo...');
    new ChatbotClient();
});
