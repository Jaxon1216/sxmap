/*!
 * 移动端交互模块
 */

import { state } from "./state.js";
import { isMobileDevice } from "./utils.js";

/**
 * 切换控制面板显示/隐藏状态
 */
export function toggleControlPanel() {
  const panel = document.getElementById("timeline-control");
  const toggleBtn = document.getElementById("toggle-panel-btn");
  const mapEl = document.getElementById("map");

  if (state.isPanelVisible) {
    panel.classList.add("hidden");
    toggleBtn.textContent = "⬆";
    mapEl.classList.remove("panel-visible");
    mapEl.classList.add("panel-hidden");
    state.isPanelVisible = false;
  } else {
    panel.classList.remove("hidden");
    toggleBtn.textContent = "⚙";
    mapEl.classList.remove("panel-hidden");
    mapEl.classList.add("panel-visible");
    state.isPanelVisible = true;
  }

  setTimeout(() => {
    if (state.map && state.map.invalidateSize) {
      state.map.invalidateSize({
        animate: true,
        pan: false,
      });
    }
  }, 350);
}

/**
 * 初始化移动端交互功能
 */
export function initMobileInteractions() {
  const toggleBtn = document.getElementById("toggle-panel-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleControlPanel);
  }

  if (state.map && isMobileDevice()) {
    state.map.on("dblclick", (e) => {
      e.originalEvent.preventDefault();
      toggleControlPanel();
    });
  }
}

