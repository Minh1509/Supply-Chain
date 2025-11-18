const API_BASE_URL = window.location.origin + '/api';

class ChatApp {
  constructor() {
    this.conversationId = null;
    this.userId = localStorage.getItem('userId') || '';
    this.userRole = localStorage.getItem('userRole') || '';
    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.autoScroll = localStorage.getItem('autoScroll') !== 'false';

    this.initElements();
    this.initEventListeners();
    this.loadSettings();
  }

  initElements() {
    this.chatMessages = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.charCount = document.getElementById('charCount');
    this.settingsModal = document.getElementById('settingsModal');
  }

  initEventListeners() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    this.messageInput.addEventListener('input', () => this.updateCharCount());

    document.getElementById('clearBtn').addEventListener('click', () => this.clearChat());
    document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
    document
      .getElementById('closeSettingsBtn')
      .addEventListener('click', () => this.closeSettings());
    document
      .getElementById('cancelSettingsBtn')
      .addEventListener('click', () => this.closeSettings());
    document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());

    document.querySelectorAll('.quick-action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const message = e.currentTarget.dataset.message;
        this.messageInput.value = message;
        this.sendMessage();
      });
    });

    this.messageInput.addEventListener('input', () => {
      this.sendBtn.disabled = !this.messageInput.value.trim();
    });
  }

  updateCharCount() {
    const length = this.messageInput.value.length;
    this.charCount.textContent = `${length}/1000`;
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    this.messageInput.value = '';
    this.updateCharCount();
    this.sendBtn.disabled = true;

    this.showTyping();

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId: this.conversationId,
          userId: this.userId || undefined,
          userRole: this.userRole || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.hideTyping();

      if (!this.conversationId && data.conversationId) {
        this.conversationId = data.conversationId;
      }

      this.addMessage(data.response, 'bot', data);
    } catch (error) {
      this.hideTyping();
      this.addMessage(
        'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        'bot',
        { error: true }
      );
      console.error('Error:', error);
    }
  }

  addMessage(text, sender, metadata = {}) {
    const welcomeMsg = this.chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
      welcomeMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '🤖' : '👤';

    const content = document.createElement('div');
    content.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    content.appendChild(bubble);
    content.appendChild(time);

    if (metadata.processingTime) {
      const meta = document.createElement('div');
      meta.className = 'message-metadata';
      meta.textContent = `⚡ ${metadata.processingTime}ms`;
      content.appendChild(meta);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    this.chatMessages.appendChild(messageDiv);

    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  showTyping() {
    this.typingIndicator.style.display = 'flex';
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  hideTyping() {
    this.typingIndicator.style.display = 'none';
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  clearChat() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      this.chatMessages.innerHTML = `
        <div class="welcome-message">
          <div class="welcome-icon">👋</div>
          <h2>Xin chào! Tôi là trợ lý AI của SCMS</h2>
          <p>Tôi có thể giúp bạn:</p>
          <div class="quick-actions">
            <button class="quick-action" data-message="Tồn kho sản phẩm ABC?">
              📦 Kiểm tra tồn kho
            </button>
            <button class="quick-action" data-message="Trạng thái đơn hàng SO-001?">
              📄 Tra cứu đơn hàng
            </button>
            <button class="quick-action" data-message="Báo cáo tồn kho tháng 11">
              📊 Xem báo cáo
            </button>
            <button class="quick-action" data-message="Làm sao để tạo phiếu xuất kho?">
              ❓ Hướng dẫn
            </button>
          </div>
        </div>
      `;
      this.conversationId = null;

      document.querySelectorAll('.quick-action').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const message = e.currentTarget.dataset.message;
          this.messageInput.value = message;
          this.sendMessage();
        });
      });
    }
  }

  openSettings() {
    this.settingsModal.classList.add('active');
  }

  closeSettings() {
    this.settingsModal.classList.remove('active');
  }

  loadSettings() {
    document.getElementById('userIdInput').value = this.userId;
    document.getElementById('userRoleSelect').value = this.userRole;
    document.getElementById('soundToggle').checked = this.soundEnabled;
    document.getElementById('autoScrollToggle').checked = this.autoScroll;
  }

  saveSettings() {
    this.userId = document.getElementById('userIdInput').value;
    this.userRole = document.getElementById('userRoleSelect').value;
    this.soundEnabled = document.getElementById('soundToggle').checked;
    this.autoScroll = document.getElementById('autoScrollToggle').checked;

    localStorage.setItem('userId', this.userId);
    localStorage.setItem('userRole', this.userRole);
    localStorage.setItem('soundEnabled', this.soundEnabled);
    localStorage.setItem('autoScroll', this.autoScroll);

    this.closeSettings();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ChatApp();
});
