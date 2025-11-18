/*!
 * 工具函数
 */

/**
 * 检测是否为移动设备
 */
export function isMobileDevice() {
  return window.innerWidth <= 768;
}

/**
 * 获取控制面板高度
 */
export function getControlPanelHeight() {
  const panel = document.getElementById("timeline-control");
  if (!panel || panel.classList.contains("hidden")) {
    return 0;
  }
  const rect = panel.getBoundingClientRect();
  return rect.height;
}

/**
 * 显示临时提示消息
 */
export function showTemporaryMessage(message, type = "info") {
  const existingMessage = document.querySelector(".temp-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = "temp-message";
  messageDiv.textContent = message;

  const colors = {
    success: { bg: "rgba(39, 174, 96, 0.9)", border: "#27ae60" },
    info: { bg: "rgba(52, 152, 219, 0.9)", border: "#3498db" },
    warning: { bg: "rgba(243, 156, 18, 0.9)", border: "#f39c12" },
  };

  const color = colors[type] || colors.info;

  Object.assign(messageDiv.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: color.bg,
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    border: `1px solid ${color.border}`,
    zIndex: "9999",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(10px)",
    maxWidth: "90vw",
    textAlign: "center",
    lineHeight: "1.4",
  });

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.opacity = "0";
      messageDiv.style.transform = "translate(-50%, -50%) scale(0.9)";
      messageDiv.style.transition = "all 0.3s ease";

      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 300);
    }
  }, 3000);
}

/**
 * 兼容性剪贴板复制方案
 */
export function fallbackCopyToClipboard(text, successCallback, errorCallback) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful && successCallback) {
      successCallback();
    } else if (!successful && errorCallback) {
      errorCallback();
    }
  } catch (err) {
    console.error("传统复制方法也失败:", err);
    if (errorCallback) {
      errorCallback(err);
    }
  }
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.display = "none";
  }
}

