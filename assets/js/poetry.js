/*!
 * 诗句动画模块
 */

import { state } from "./state.js";
import { POETRY_TEXTS } from "./config.js";

/**
 * 显示诗句动画消息（带状态控制）
 */
export function showPoetryMessage() {
  if (state.isPoetryAnimationPlaying) {
    console.log("诗句动画正在播放中，忽略新的触发");
    return;
  }

  state.isPoetryAnimationPlaying = true;
  console.log("开始播放诗句动画");

  if (state.poetryAnimationTimeout) {
    clearTimeout(state.poetryAnimationTimeout);
    state.poetryAnimationTimeout = null;
  }

  const existingPoetry = document.querySelector(".poetry-message");
  if (existingPoetry) {
    existingPoetry.remove();
  }

  const poetryDiv = document.createElement("div");
  poetryDiv.className = "poetry-message";

  const randomPoetry =
    POETRY_TEXTS[Math.floor(Math.random() * POETRY_TEXTS.length)];
  poetryDiv.textContent = randomPoetry;

  Object.assign(poetryDiv.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) scale(0.3)",
    background:
      "linear-gradient(135deg, rgba(200, 16, 46, 0.95), rgba(139, 69, 19, 0.95))",
    color: "#f4f1de",
    padding: "24px 32px",
    borderRadius: "16px",
    border: "2px solid rgba(255, 215, 0, 0.6)",
    zIndex: "9999",
    fontSize: "18px",
    fontWeight: "700",
    fontFamily: "'KaiTi', '楷体', serif",
    boxShadow:
      "0 8px 32px rgba(200, 16, 46, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(12px)",
    maxWidth: "80vw",
    textAlign: "center",
    lineHeight: "1.6",
    letterSpacing: "2px",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
    opacity: "0",
    pointerEvents: "none",
    transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  });

  document.body.appendChild(poetryDiv);

  requestAnimationFrame(() => {
    poetryDiv.style.opacity = "1";
    poetryDiv.style.transform = "translate(-50%, -50%) scale(1)";
  });

  setTimeout(() => {
    if (poetryDiv.parentNode && state.isPoetryAnimationPlaying) {
      poetryDiv.style.transform = "translate(-50%, -50%) scale(1.1)";
      poetryDiv.style.fontSize = "20px";
    }
  }, 800);

  setTimeout(() => {
    if (poetryDiv.parentNode && state.isPoetryAnimationPlaying) {
      poetryDiv.style.transform = "translate(-50%, -50%) scale(1.3)";
      poetryDiv.style.opacity = "0.3";
      poetryDiv.style.fontSize = "24px";
      poetryDiv.style.filter = "blur(1px)";
    }
  }, 2200);

  setTimeout(() => {
    if (poetryDiv.parentNode && state.isPoetryAnimationPlaying) {
      poetryDiv.style.transform = "translate(-50%, -50%) scale(1.8)";
      poetryDiv.style.opacity = "0";
      poetryDiv.style.filter = "blur(3px)";

      setTimeout(() => {
        if (poetryDiv.parentNode) {
          poetryDiv.remove();
        }
        state.isPoetryAnimationPlaying = false;
        console.log("诗句动画播放完成，状态已重置");
      }, 800);
    } else if (!state.isPoetryAnimationPlaying) {
      if (poetryDiv.parentNode) {
        poetryDiv.remove();
      }
    }
  }, 3500);

  setTimeout(() => {
    if (poetryDiv.parentNode && state.isPoetryAnimationPlaying) {
      poetryDiv.style.boxShadow =
        "0 8px 32px rgba(255, 215, 0, 0.8), inset 0 2px 8px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.6)";
    }
  }, 1000);

  setTimeout(() => {
    if (poetryDiv.parentNode && state.isPoetryAnimationPlaying) {
      poetryDiv.style.boxShadow =
        "0 8px 32px rgba(200, 16, 46, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.2)";
    }
  }, 1800);

  state.poetryAnimationTimeout = setTimeout(() => {
    if (state.isPoetryAnimationPlaying) {
      console.warn("诗句动画超时保护触发，强制重置状态");
      state.isPoetryAnimationPlaying = false;

      const remainingPoetry = document.querySelector(".poetry-message");
      if (remainingPoetry) {
        remainingPoetry.remove();
      }
    }
    state.poetryAnimationTimeout = null;
  }, 5000);
}

/**
 * 强制停止诗句动画
 */
export function forceStopPoetryAnimation() {
  if (state.isPoetryAnimationPlaying) {
    state.isPoetryAnimationPlaying = false;

    if (state.poetryAnimationTimeout) {
      clearTimeout(state.poetryAnimationTimeout);
      state.poetryAnimationTimeout = null;
    }

    const poetryElements = document.querySelectorAll(".poetry-message");
    poetryElements.forEach((element) => {
      if (element.parentNode) {
        element.remove();
      }
    });
  }
}

