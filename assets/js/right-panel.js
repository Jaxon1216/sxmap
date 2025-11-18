/*!
 * 右侧控制面板模块
 */

import { state } from "./state.js";
import { showEventAtIndex } from "./paths.js";

/**
 * 初始化右侧控制面板
 */
export function initRightPanel() {
  // 初始化统计信息折叠功能
  initStatsToggle();

  // 加载完数据后初始化事件列表
  if (state.trajectoryData && state.trajectoryData.events) {
    renderEventsList();
  }
}

/**
 * 初始化统计信息折叠功能
 */
function initStatsToggle() {
  const statsToggle = document.querySelector(".stats-toggle");
  const statsSection = document.querySelector(".stats-section");

  if (statsToggle && statsSection) {
    statsToggle.addEventListener("click", () => {
      statsSection.classList.toggle("collapsed");
    });
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

