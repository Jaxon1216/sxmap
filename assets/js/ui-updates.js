/*!
 * UI更新模块
 */

import { state } from "./state.js";
import { updateEventsListHighlight } from "./right-panel.js";

/**
 * 更新当前事件信息显示
 */
export function updateCurrentEventInfo(event) {
  const pcElements = {
    "event-date": event.date,
    "event-title": event.event,
    "event-location": event.endLocation,
    "current-age": event.age,
  };

  Object.entries(pcElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  const mobileElements = {
    "event-date-mobile": event.date,
    "event-title-mobile": event.event,
    "event-location-mobile": event.endLocation,
    "current-age-mobile": event.age,
  };

  Object.entries(mobileElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

/**
 * 更新进度信息
 */
export function updateProgress() {
  const progress = state.trajectoryData
    ? ((state.currentEventIndex + 1) / state.trajectoryData.events.length) * 100
    : 0;

  const mobileElements = {
    "current-progress-mobile": progress.toFixed(1) + "%",
    "current-event-index-mobile": state.currentEventIndex + 1,
  };

  Object.entries(mobileElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  const desktopElements = {
    "current-progress-desktop": progress.toFixed(1) + "%",
    "current-event-index-desktop": state.currentEventIndex + 1,
    "current-age-desktop": state.trajectoryData.events[state.currentEventIndex].age,
  };

  Object.entries(desktopElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  const slider = document.getElementById("timeline-slider");
  if (slider && !slider.matches(":active")) {
    slider.value = state.currentEventIndex;
  }

  // 更新右侧面板事件列表高亮
  updateEventsListHighlight();
}

/**
 * 更新时间范围显示
 */
export function updateTimeRange() {
  if (!state.trajectoryData || !state.trajectoryData.events || state.trajectoryData.events.length === 0) {
    return;
  }

  const events = state.trajectoryData.events;
  const startDate = events[0].date;
  const endDate = events[events.length - 1].date;

  // 更新右侧面板顶部的时间范围
  const startTopEl = document.getElementById("time-range-start-top");
  const endTopEl = document.getElementById("time-range-end-top");
  if (startTopEl) {
    startTopEl.textContent = startDate;
  }
  if (endTopEl) {
    endTopEl.textContent = endDate;
  }

  // 更新移动端时间轴的时间范围
  const startMobileEl = document.getElementById("time-range-start-mobile");
  const endMobileEl = document.getElementById("time-range-end-mobile");
  if (startMobileEl) {
    startMobileEl.textContent = startDate;
  }
  if (endMobileEl) {
    endMobileEl.textContent = endDate;
  }
}

/**
 * 更新统计数据
 */
export function updateStatistics() {
  if (!state.trajectoryData || !state.trajectoryData.events) {
    return;
  }

  const events = state.trajectoryData.events;
  const movementEvents = events.filter(
    (e) => e.movementType !== "出生" && e.movementType !== "原地活动"
  );
  const internationalEvents = events.filter(
    (e) => e.movementType === "国际移动"
  );

  const visitedPlaces = new Set();
  events.forEach((event) => {
    if (event.endLocation) {
      let location = event.endLocation;
      if (location.includes("省")) {
        location = location.split("省")[0] + "省";
      } else if (location.includes("市")) {
        location = location.split("市")[0] + "市";
      }
      visitedPlaces.add(location);
    }
  });

  const startYear = parseInt(events[0].date.split("-")[0]);
  const endYear = parseInt(events[events.length - 1].date.split("-")[0]);
  const timeSpan = endYear - startYear;

  const pcStats = {
    "total-events": events.length,
    "movement-count": movementEvents.length,
    "visited-places": visitedPlaces.size,
    "international-count": internationalEvents.length,
    "time-span": timeSpan + "年",
  };

  Object.entries(pcStats).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

