/*!
 * 面板控制模块
 */

import { state } from "./state.js";
import { isMobileDevice } from "./utils.js";
import { highlightEventPath, clearPathHighlight, quickClearPathHighlight } from "./path-highlight.js";

/**
 * 显示地点详细信息面板
 */
export function showDetailPanel(locationGroup) {
  const panel = document.getElementById("location-detail-panel");
  const backdrop = document.getElementById("panel-backdrop");
  const titleEl = document.getElementById("panel-location-title");
  const summaryEl = document.getElementById("panel-visit-summary");
  const contentEl = document.getElementById("panel-content");

  if (!panel || !titleEl || !summaryEl || !contentEl) {
    return;
  }

  const { location, events } = locationGroup;
  const visitCount = events.length;
  const transitCount = events.filter((e) => e.visitType === "途径").length;
  const destCount = events.filter((e) => e.visitType === "目的地").length;
  const startCount = events.filter((e) => e.visitType === "起点").length;
  const activityCount = events.filter((e) => e.visitType === "活动").length;
  const birthCount = events.filter((e) => e.visitType === "出生").length;

  titleEl.textContent = `📍 ${location}`;

  let summaryText = `截止当前时间点共 <span class="visit-count-highlight">${visitCount}</span> 次相关记录`;

  const descParts = [];
  if (birthCount > 0) {
    descParts.push(`${birthCount}次出生`);
  }
  if (destCount > 0) {
    descParts.push(`${destCount}次到达`);
  }
  if (startCount > 0) {
    descParts.push(`${startCount}次出发`);
  }
  if (transitCount > 0) {
    descParts.push(`${transitCount}次途径`);
  }
  if (activityCount > 0) {
    descParts.push(`${activityCount}次活动`);
  }

  if (descParts.length > 0) {
    summaryText += ` (${descParts.join("，")})`;
  }

  summaryEl.innerHTML = summaryText;

  const sortedEvents = [...events].sort((a, b) => a.index - b.index);

  const eventListHtml = sortedEvents
    .map((event, index) => {
      const isCurrentEvent = event.index === state.currentEventIndex;
      const itemClass = isCurrentEvent
        ? "event-item current-event"
        : "event-item";

      let visitTypeClass = "";
      let visitTypeLabel = "";
      let visitOrderClass = "";

      const orderNumber = `第${index + 1}次`;

      switch (event.visitType) {
        case "出生":
          visitTypeClass = "birth-event";
          visitTypeLabel = "出生";
          visitOrderClass = "birth-order";
          break;
        case "起点":
          visitTypeClass = "start-event";
          visitTypeLabel = "出发";
          visitOrderClass = "start-order";
          break;
        case "目的地":
          visitTypeLabel = "到达";
          visitOrderClass = "";
          break;
        case "途径":
          visitTypeClass = "transit-event";
          visitTypeLabel = "途径";
          visitOrderClass = "transit-order";
          break;
        case "活动":
          visitTypeClass = "activity-event";
          visitTypeLabel = "活动";
          visitOrderClass = "activity-order";
          break;
      }

      return `
      <div class="${itemClass} ${visitTypeClass}" data-event-index="${
  event.index
}">
        <div class="event-header">
          <span class="visit-order-number">${orderNumber}</span>
          <span class="event-date-item">${event.date}</span>
          <span class="visit-order ${visitOrderClass}">${visitTypeLabel}</span>
        </div>
        <div class="event-description">${
  event.originalEvent || event.event
}</div>
        ${event.age ? `<div class="event-age">年龄: ${event.age}岁</div>` : ""}
      </div>
    `;
    })
    .join("");

  contentEl.innerHTML = eventListHtml;

  const eventItems = contentEl.querySelectorAll(".event-item");
  eventItems.forEach((item) => {
    const eventIndex = parseInt(item.dataset.eventIndex);

    item.addEventListener("click", (e) => {
      e.stopPropagation();

      if (state.currentHighlightedEventIndex === eventIndex) {
        clearPathHighlight();
        return;
      }

      if (state.currentHighlightedEventIndex !== -1) {
        quickClearPathHighlight();
      }

      highlightEventPath(eventIndex);

      item.classList.add("event-item-clicked");
      setTimeout(() => {
        item.classList.remove("event-item-clicked");
      }, 300);
    });

    item.addEventListener("mouseenter", (_e) => {
      if (state.currentHighlightedEventIndex !== eventIndex) {
        item.style.cursor = "pointer";
        item.style.transform = "translateX(2px)";
      }
    });

    item.addEventListener("mouseleave", (_e) => {
      item.style.transform = "";
    });
  });

  if (backdrop && isMobileDevice()) {
    backdrop.classList.add("visible");
  }

  panel.classList.add("visible");

  if (isMobileDevice()) {
    setTimeout(() => {
      initPanelDragClose();
    }, 100);
  }
}

/**
 * 隐藏详细信息面板
 */
export function hideDetailPanel() {
  const panel = document.getElementById("location-detail-panel");
  const backdrop = document.getElementById("panel-backdrop");

  if (panel) {
    panel.classList.remove("visible", "dragging");
    panel.style.transform = "";
    panel.style.transition = "";
  }

  if (backdrop) {
    backdrop.classList.remove("visible", "dragging");
    backdrop.style.opacity = "";
    backdrop.style.transition = "";
  }

  if (window.cleanupDragListeners) {
    try {
      window.cleanupDragListeners();
    } catch (error) {
      console.warn("清理拖拽监听器时出错:", error);
    }
  }
}

/**
 * 初始化详细信息面板交互
 */
export function initDetailPanel() {
  const panel = document.getElementById("location-detail-panel");
  const backdrop = document.getElementById("panel-backdrop");
  const closeBtn = document.getElementById("panel-close-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", hideDetailPanel);
  }

  if (backdrop) {
    backdrop.addEventListener("click", hideDetailPanel);
  }

  if (panel) {
    panel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  if (!isMobileDevice()) {
    document.addEventListener("click", (e) => {
      if (panel && panel.classList.contains("visible")) {
        const isClickInsidePanel = panel.contains(e.target);
        const isClickOnMarker = e.target.closest(".leaflet-marker-icon");

        if (!isClickInsidePanel && !isClickOnMarker) {
          hideDetailPanel();
        }
      }
    });
  }
}

/**
 * 初始化PC端统计面板悬停交互
 */
export function initStatsHover() {
  const statsPanel = document.getElementById("stats-panel");
  const hoverArea = document.getElementById("stats-hover-area");

  if (!statsPanel || !hoverArea || isMobileDevice()) {
    return;
  }

  function showStatsPanel() {
    if (state.statsHoverTimeout) {
      clearTimeout(state.statsHoverTimeout);
      state.statsHoverTimeout = null;
    }
    statsPanel.classList.add("visible");
  }

  function hideStatsPanel() {
    state.statsHoverTimeout = setTimeout(() => {
      statsPanel.classList.remove("visible");
    }, 150);
  }

  hoverArea.addEventListener("mouseenter", showStatsPanel);
  hoverArea.addEventListener("mouseleave", hideStatsPanel);
  statsPanel.addEventListener("mouseenter", showStatsPanel);
  statsPanel.addEventListener("mouseleave", hideStatsPanel);
}

/**
 * 初始化详细面板拖拽关闭功能（移动端）
 */
function initPanelDragClose() {
  if (!isMobileDevice()) {
    return;
  }

  const panel = document.getElementById("location-detail-panel");
  const panelHeader = panel?.querySelector(".panel-header");
  const backdrop = document.getElementById("panel-backdrop");

  if (!panel || !panelHeader) {
    return;
  }

  let touchState = {
    startY: 0,
    currentY: 0,
    deltaY: 0,
    startTime: 0,
    isDragging: false,
    hasMoved: false,
    isProcessing: false,
  };

  function resetAllStates(isClosing = false) {
    touchState = {
      startY: 0,
      currentY: 0,
      deltaY: 0,
      startTime: 0,
      isDragging: false,
      hasMoved: false,
      isProcessing: false,
    };

    panel.classList.remove("dragging");
    panelHeader.classList.remove("dragging");

    if (!isClosing) {
      panel.style.transform = "translateY(0)";
      panel.style.transition =
        "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

      if (backdrop) {
        backdrop.style.opacity = "0.3";
        backdrop.style.transition = "opacity 0.3s ease";
      }

      if (!panel.classList.contains("visible")) {
        panel.classList.add("visible");
      }

      setTimeout(() => {
        if (panel.style.transition.includes("transform")) {
          panel.style.transition = "";
        }
        if (backdrop && backdrop.style.transition.includes("opacity")) {
          backdrop.style.transition = "";
        }
      }, 350);
    }
  }

  function safeClosePanel() {
    touchState.isProcessing = true;

    panel.style.transform = "translateY(100%)";
    panel.style.transition =
      "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    if (backdrop) {
      backdrop.style.opacity = "0";
      backdrop.style.transition = "opacity 0.3s ease";
    }

    setTimeout(() => {
      try {
        hideDetailPanel();
      } catch (error) {
        console.error("关闭面板时出错:", error);
      }

      setTimeout(() => {
        resetAllStates(true);
      }, 100);
    }, 300);
  }

  function handleTouchStart(e) {
    if (touchState.isProcessing) {
      return;
    }

    if (
      e.target.closest(".panel-close") ||
      e.target.closest(".panel-content")
    ) {
      return;
    }

    const touch = e.touches[0];
    touchState.startY = touch.clientY;
    touchState.currentY = touch.clientY;
    touchState.startTime = Date.now();
    touchState.isDragging = true;
    touchState.hasMoved = false;
    touchState.deltaY = 0;

    panel.classList.add("dragging");
    panelHeader.classList.add("dragging");

    panel.style.transition = "none";
    if (backdrop) {
      backdrop.style.transition = "none";
    }

    e.preventDefault();
  }

  function handleTouchMove(e) {
    if (!touchState.isDragging || touchState.isProcessing) {
      return;
    }

    const touch = e.touches[0];
    touchState.currentY = touch.clientY;
    touchState.deltaY = touchState.currentY - touchState.startY;

    if (!touchState.hasMoved && Math.abs(touchState.deltaY) > 3) {
      touchState.hasMoved = true;
    }

    if (touchState.deltaY > 0) {
      const maxDrag = 250;
      const dampingFactor = Math.max(
        0.3,
        1 - (touchState.deltaY / maxDrag) * 0.7
      );
      const transformValue = Math.min(
        touchState.deltaY * dampingFactor,
        maxDrag
      );

      panel.style.transform = `translateY(${transformValue}px)`;

      if (backdrop) {
        const maxOpacity = 0.3;
        const opacityReduction = (touchState.deltaY / 200) * maxOpacity;
        const newOpacity = Math.max(0.05, maxOpacity - opacityReduction);
        backdrop.style.opacity = newOpacity.toString();
      }
    } else {
      panel.style.transform = "translateY(0)";
      if (backdrop) {
        backdrop.style.opacity = "0.3";
      }
    }

    e.preventDefault();
  }

  function handleTouchEnd(_e) {
    if (!touchState.isDragging) {
      return;
    }

    const duration = Date.now() - touchState.startTime;
    const velocity = duration > 0 ? Math.abs(touchState.deltaY) / duration : 0;

    panel.classList.remove("dragging");
    panelHeader.classList.remove("dragging");

    panel.style.transition =
      "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    if (backdrop) {
      backdrop.style.transition = "opacity 0.3s ease";
    }

    const shouldClose =
      touchState.hasMoved &&
      (touchState.deltaY > 40 ||
        (touchState.deltaY > 20 && velocity > 0.2) ||
        (touchState.deltaY > 10 && velocity > 0.5));

    if (shouldClose) {
      safeClosePanel();
    } else {
      resetAllStates(false);
    }
  }

  function handleTouchCancel(_e) {
    if (touchState.isDragging && !touchState.isProcessing) {
      resetAllStates();
    }
  }

  function cleanupEventListeners() {
    panelHeader.removeEventListener("touchstart", handleTouchStart);
    panelHeader.removeEventListener("touchmove", handleTouchMove);
    panelHeader.removeEventListener("touchend", handleTouchEnd);
    panelHeader.removeEventListener("touchcancel", handleTouchCancel);
  }

  function bindEventListeners() {
    panelHeader.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    panelHeader.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    panelHeader.addEventListener("touchend", handleTouchEnd, {
      passive: false,
    });

    panelHeader.addEventListener("touchcancel", handleTouchCancel, {
      passive: false,
    });
  }

  cleanupEventListeners();
  bindEventListeners();

  const panelContent = panel.querySelector(".panel-content");
  if (panelContent) {
    panelContent.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );

    panelContent.addEventListener(
      "touchmove",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );
  }

  const closeBtn = panel.querySelector(".panel-close");
  if (closeBtn) {
    closeBtn.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideDetailPanel();
    });
  }

  window.cleanupDragListeners = cleanupEventListeners;
}

