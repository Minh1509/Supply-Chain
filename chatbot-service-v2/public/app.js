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
}
