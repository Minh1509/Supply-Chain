// Configuration
const CONFIG = {
  apiUrl: "http://localhost:3006",
  sessionId: generateSessionId(),
  useWebSocket: true,
};

// State
let socket = null;
let stats = {
  sent: 0,
  received: 0,
};

// DOM Elements
const DOM = {
  messages: document.getElementById("messages"),
  messageInput: document.getElementById("message-input"),
  btnSend: document.getElementById("btn-send"),
  btnClear: document.getElementById("btn-clear"),
  btnNewSession: document.getElementById("btn-new-session"),
  typingIndicator: document.getElementById("typing-indicator"),
  connectionStatus: document.getElementById("connection-status"),
  statusDot: document.getElementById("status-dot"),
  apiUrlInput: document.getElementById("api-url"),
  sessionIdInput: document.getElementById("session-id"),
  useWebSocketCheckbox: document.getElementById("use-websocket"),
  statSent: document.getElementById("stat-sent"),
  statReceived: document.getElementById("stat-received"),
  statConnection: document.getElementById("stat-connection"),
};

// Initialize
function init() {
  // Set initial values
  DOM.apiUrlInput.value = CONFIG.apiUrl;
  DOM.sessionIdInput.value = CONFIG.sessionId;
  DOM.useWebSocketCheckbox.checked = CONFIG.useWebSocket;

  // Connect
  if (CONFIG.useWebSocket) {
    connectWebSocket();
  } else {
    updateConnectionStatus(true, "REST API");
  }

  // Event Listeners
  DOM.messageInput.addEventListener("input", handleInputChange);
  DOM.messageInput.addEventListener("keydown", handleKeyPress);
  DOM.btnSend.addEventListener("click", sendMessage);
  DOM.btnClear.addEventListener("click", clearChat);
  DOM.btnNewSession.addEventListener("click", createNewSession);
  DOM.apiUrlInput.addEventListener("change", updateApiUrl);
  DOM.useWebSocketCheckbox.addEventListener("change", toggleConnectionType);

  updateStats();
}

// Generate Session ID
function generateSessionId() {
  return (
    "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}

// WebSocket Connection
function connectWebSocket() {
  try {
    socket = io(`${CONFIG.apiUrl}/chat`, {
      transports: ["websocket", "polling"],
      query: {
        sessionId: CONFIG.sessionId,
      },
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      updateConnectionStatus(true, "WebSocket");
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      updateConnectionStatus(false, "WebSocket");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      updateConnectionStatus(false, "WebSocket");
    });

    socket.on("message", (data) => {
      console.log("📨 Received:", data);
      hideTypingIndicator();
      addMessage("bot", data.message, data.timestamp);
      stats.received++;
      updateStats();
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      hideTypingIndicator();
      addMessage(
        "bot",
        `❌ Lỗi: ${error.message || "Đã xảy ra lỗi"}`,
        new Date().toISOString()
      );
    });
  } catch (error) {
    console.error("Failed to connect:", error);
    updateConnectionStatus(false, "WebSocket");
  }
}

// Update Connection Status
function updateConnectionStatus(isConnected, type) {
  if (isConnected) {
    DOM.statusDot.classList.remove("disconnected");
    DOM.connectionStatus.textContent = `Đã kết nối (${type})`;
  } else {
    DOM.statusDot.classList.add("disconnected");
    DOM.connectionStatus.textContent = "Mất kết nối";
  }
  DOM.statConnection.textContent = type;
}

// Handle Input Change
function handleInputChange() {
  const hasValue = DOM.messageInput.value.trim().length > 0;
  DOM.btnSend.disabled = !hasValue;

  // Auto-resize textarea
  DOM.messageInput.style.height = "auto";
  DOM.messageInput.style.height = DOM.messageInput.scrollHeight + "px";
}

// Handle Key Press
function handleKeyPress(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// Send Message
async function sendMessage() {
  const message = DOM.messageInput.value.trim();
  if (!message) return;

  // Clear input
  DOM.messageInput.value = "";
  DOM.messageInput.style.height = "auto";
  DOM.btnSend.disabled = true;

  // Add user message
  addMessage("user", message, new Date().toISOString());
  stats.sent++;
  updateStats();

  // Show typing indicator
  showTypingIndicator();

  try {
    if (CONFIG.useWebSocket && socket && socket.connected) {
      // Send via WebSocket
      socket.emit("message", {
        sessionId: CONFIG.sessionId,
        message: message,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Send via REST API
      const response = await fetch(`${CONFIG.apiUrl}/api/v1/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: CONFIG.sessionId,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      hideTypingIndicator();
      addMessage("bot", data.message, data.timestamp);
      stats.received++;
      updateStats();
    }
  } catch (error) {
    console.error("❌ Failed to send:", error);
    hideTypingIndicator();
    addMessage(
      "bot",
      `❌ Lỗi khi gửi tin nhắn: ${error.message}`,
      new Date().toISOString()
    );
  }
}

// Send Quick Message
function sendQuickMessage(message) {
  DOM.messageInput.value = message;
  handleInputChange();
  sendMessage();
}

// Add Message
function addMessage(sender, text, timestamp) {
  const messageDiv = document.createElement("div");
  messageDiv.className =
    sender === "user" ? "message user-message" : "message bot-message";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "👤" : "🤖";

  const content = document.createElement("div");
  content.className = "message-content";

  const textDiv = document.createElement("div");
  textDiv.className = "message-text";
  textDiv.innerHTML = formatMessage(text);

  const timeDiv = document.createElement("div");
  timeDiv.className = "message-time";
  timeDiv.textContent = formatTime(timestamp);

  textDiv.appendChild(timeDiv);
  content.appendChild(textDiv);
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);

  DOM.messages.appendChild(messageDiv);
  scrollToBottom();
}

// Format Message
function formatMessage(text) {
  // Convert line breaks
  let formatted = text.replace(/\n/g, "<br>");

  // Bold **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic *text*
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Code `text`
  formatted = formatted.replace(/`(.*?)`/g, "<code>$1</code>");

  return formatted;
}

// Format Time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Show/Hide Typing Indicator
function showTypingIndicator() {
  DOM.typingIndicator.style.display = "flex";
  scrollToBottom();
}

function hideTypingIndicator() {
  DOM.typingIndicator.style.display = "none";
}

// Scroll to Bottom
function scrollToBottom() {
  setTimeout(() => {
    DOM.messages.scrollTop = DOM.messages.scrollHeight;
  }, 100);
}

// Clear Chat
async function clearChat() {
  if (!confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat?")) {
    return;
  }

  try {
    if (CONFIG.useWebSocket && socket && socket.connected) {
      socket.emit("clear_history", { sessionId: CONFIG.sessionId });
    } else {
      const response = await fetch(
        `${CONFIG.apiUrl}/api/v1/chat/history/${CONFIG.sessionId}/clear`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to clear chat");
      }
    }

    // Clear UI (keep welcome message)
    const welcomeMsg = DOM.messages.querySelector(".bot-message");
    DOM.messages.innerHTML = "";
    if (welcomeMsg) {
      DOM.messages.appendChild(welcomeMsg.cloneNode(true));
    }

    stats.sent = 0;
    stats.received = 0;
    updateStats();

    console.log("✅ Chat cleared");
  } catch (error) {
    console.error("❌ Failed to clear:", error);
    alert("Không thể xóa lịch sử chat. Vui lòng thử lại!");
  }
}

// Create New Session
function createNewSession() {
  CONFIG.sessionId = generateSessionId();
  DOM.sessionIdInput.value = CONFIG.sessionId;

  // Reconnect
  if (CONFIG.useWebSocket && socket) {
    socket.disconnect();
    connectWebSocket();
  }

  // Clear messages (keep welcome)
  const welcomeMsg = DOM.messages.querySelector(".bot-message");
  DOM.messages.innerHTML = "";
  if (welcomeMsg) {
    DOM.messages.appendChild(welcomeMsg.cloneNode(true));
  }

  stats.sent = 0;
  stats.received = 0;
  updateStats();

  console.log("✅ New session created:", CONFIG.sessionId);
}

// Update API URL
function updateApiUrl() {
  CONFIG.apiUrl = DOM.apiUrlInput.value;
  if (CONFIG.useWebSocket && socket) {
    socket.disconnect();
    connectWebSocket();
  }
  console.log("🔄 API URL updated:", CONFIG.apiUrl);
}

// Toggle Connection Type
function toggleConnectionType() {
  CONFIG.useWebSocket = DOM.useWebSocketCheckbox.checked;

  if (CONFIG.useWebSocket) {
    connectWebSocket();
  } else {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    updateConnectionStatus(true, "REST API");
  }
}

// Update Stats
function updateStats() {
  DOM.statSent.textContent = stats.sent;
  DOM.statReceived.textContent = stats.received;
}

// Load Chat History
async function loadChatHistory() {
  try {
    const response = await fetch(
      `${CONFIG.apiUrl}/api/v1/chat/history/${CONFIG.sessionId}`
    );
    if (response.ok) {
      const data = await response.json();
      if (data.history && data.history.length > 0) {
        // Remove welcome message if history exists
        const welcomeMsg = DOM.messages.querySelector(".bot-message");
        if (welcomeMsg) {
          welcomeMsg.remove();
        }

        // Add history messages
        data.history.forEach((msg) => {
          addMessage(
            msg.role === "user" ? "user" : "bot",
            msg.content,
            msg.timestamp
          );
        });

        stats.sent = data.history.filter((m) => m.role === "user").length;
        stats.received = data.history.filter(
          (m) => m.role === "assistant"
        ).length;
        updateStats();

        console.log("📚 Loaded chat history:", data.history.length, "messages");
      }
    }
  } catch (error) {
    console.error("❌ Failed to load history:", error);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Chatbot Frontend Initialized");
  init();
  setTimeout(loadChatHistory, 500);
});

// Make sendQuickMessage global
window.sendQuickMessage = sendQuickMessage;
