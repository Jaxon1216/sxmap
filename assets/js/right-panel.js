/*!
 * 右侧控制面板模块
 */

import { state } from "./state.js";
import { showEventAtIndex } from "./paths.js";

/**
 * 初始化右侧控制面板
 */
export function initRightPanel() {
  // 初始化统计信息弹出层功能
  initStatsPopup();

  // 加载完数据后初始化事件列表
  if (state.trajectoryData && state.trajectoryData.events) {
    renderEventsList();
  }
}

/**
 * 初始化统计信息弹出层功能
 */
function initStatsPopup() {
  const statsToggleBtn = document.getElementById("stats-toggle-btn");
  const statsPopup = document.getElementById("stats-popup");
  const statsPopupClose = document.getElementById("stats-popup-close");

  if (!statsToggleBtn || !statsPopup) {
    return;
  }

  // 点击统计按钮切换弹出层显示状态
  statsToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = statsPopup.classList.contains("visible");

    if (isVisible) {
      hideStatsPopup();
    } else {
      showStatsPopup();
    }
  });

  // 点击关闭按钮
  if (statsPopupClose) {
    statsPopupClose.addEventListener("click", (e) => {
      e.stopPropagation();
      hideStatsPopup();
    });
  }

  // 点击弹出层外部区域关闭
  document.addEventListener("click", (e) => {
    if (statsPopup.classList.contains("visible")) {
      // 检查点击是否在弹出层内部
      if (!statsPopup.contains(e.target) && !statsToggleBtn.contains(e.target)) {
        hideStatsPopup();
      }
    }
  });

  // 阻止弹出层内部点击冒泡
  statsPopup.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

/**
 * 显示统计信息弹出层
 */
function showStatsPopup() {
  const statsPopup = document.getElementById("stats-popup");
  const statsToggleBtn = document.getElementById("stats-toggle-btn");

  if (statsPopup) {
    statsPopup.classList.add("visible");
  }

  if (statsToggleBtn) {
    statsToggleBtn.classList.add("active");
  }
}

/**
 * 隐藏统计信息弹出层
 */
function hideStatsPopup() {
  const statsPopup = document.getElementById("stats-popup");
  const statsToggleBtn = document.getElementById("stats-toggle-btn");

  if (statsPopup) {
    statsPopup.classList.remove("visible");
  }

  if (statsToggleBtn) {
    statsToggleBtn.classList.remove("active");
  }
}

/**
 * 渲染事件列表
 */
export function renderEventsList() {
  if (!state.trajectoryData || !state.trajectoryData.events) {
    return;
  }

  const container = document.getElementById("events-list-container");
  if (!container) {
    return;
  }

  const events = state.trajectoryData.events;

  // 生成事件列表HTML
  const eventsHtml = events.map((event, index) => {
    const isCurrent = index === state.currentEventIndex;

    return `
      <div class="event-list-item ${isCurrent ? "current" : ""}" data-event-index="${index}">
        <div class="event-list-item-header">
          <span class="event-list-date">${event.date}</span>
          <span class="event-list-location">${event.endLocation}</span>
        </div>
        <div class="event-list-title">${event.event}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = eventsHtml;

  // 绑定点击事件
  const eventItems = container.querySelectorAll(".event-list-item");
  eventItems.forEach((item) => {
    item.addEventListener("click", () => {
      const eventIndex = parseInt(item.dataset.eventIndex);

      // 如果正在播放，先停止播放
      if (state.isPlaying) {
        state.isPlaying = false;
        if (state.playInterval) {
          clearTimeout(state.playInterval);
          state.playInterval = null;
        }
        const playBtn = document.getElementById("play-btn");
        if (playBtn) {
          playBtn.textContent = "▶";
          playBtn.title = "播放";
        }
      }

      // 跳转到选中的事件（如果不是当前事件）
      if (eventIndex !== state.currentEventIndex) {
        showEventAtIndex(eventIndex, false);
      }
    });
  });

  // 滚动到第一个事件
  scrollToCurrentEvent(false);
}

/**
 * 更新事件列表高亮
 */
export function updateEventsListHighlight() {
  const container = document.getElementById("events-list-container");
  if (!container) {
    return;
  }

  // 移除所有高亮
  const allItems = container.querySelectorAll(".event-list-item");
  allItems.forEach((item) => {
    item.classList.remove("current");
  });

  // 添加当前事件高亮
  const currentItem = container.querySelector(
    `.event-list-item[data-event-index="${state.currentEventIndex}"]`
  );

  if (currentItem) {
    currentItem.classList.add("current");

    // 自动滚动到当前事件
    scrollToCurrentEvent(true);
  }
}

/**
 * 滚动到当前事件
 */
function scrollToCurrentEvent(smooth = true) {
  const container = document.getElementById("events-list-container");
  if (!container) {
    return;
  }

  const currentItem = container.querySelector(
    `.event-list-item[data-event-index="${state.currentEventIndex}"]`
  );

  if (currentItem) {
    // 使用 scrollIntoView 方法，将当前事件滚动到可视区域中间
    // block: 'center' 会尽量将元素居中，但对于顶部和底部的元素会自动调整
    currentItem.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "center",
      inline: "nearest"
    });
  }
}

/**
 * 在数据加载后初始化面板
 */
export function initPanelAfterDataLoad() {
  renderEventsList();
}

