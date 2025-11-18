/*!
 * 播放控制和键盘控制模块
 */

import { state } from './state.js';
import { showEventAtIndex } from './paths.js';
import { showPoetryMessage } from './poetry.js';
import { SPEED_LABELS } from './config.js';
import { showTemporaryMessage, fallbackCopyToClipboard } from './utils.js';

/**
 * 切换播放/暂停状态
 */
export function togglePlay() {
  const btn = document.getElementById("play-btn");
  if (!btn) return;

  if (state.isPlaying) {
    state.isPlaying = false;
    if (state.playInterval) {
      clearTimeout(state.playInterval);
      state.playInterval = null;
    }
    btn.textContent = "▶";
    btn.title = "播放";
  } else {
    state.isPlaying = true;
    btn.textContent = "⏸";
    btn.title = "暂停";
    playNextEvent();
  }
}

/**
 * 递归播放下一个事件
 */
function playNextEvent() {
  if (!state.isPlaying || state.currentEventIndex >= state.trajectoryData.events.length - 1) {
    if (state.currentEventIndex >= state.trajectoryData.events.length - 1) {
      state.isPlaying = false;
      const btn = document.getElementById("play-btn");
      if (btn) {
        btn.textContent = "▶";
        btn.title = "播放";
      }
    }
    return;
  }

  showEventAtIndex(state.currentEventIndex + 1, true);

  const waitTime = Math.max(
    state.currentPlaySpeed,
    state.animationConfig.pathDuration + 200
  );

  state.playInterval = setTimeout(() => {
    playNextEvent();
  }, waitTime);
}

/**
 * 下一个事件
 */
export function nextEvent() {
  if (state.currentEventIndex < state.trajectoryData.events.length - 1) {
    showEventAtIndex(state.currentEventIndex + 1, true, true);
  }
}

/**
 * 上一个事件
 */
export function previousEvent() {
  if (state.currentEventIndex > 0) {
    showEventAtIndex(state.currentEventIndex - 1, true, true);
  }
}

/**
 * 统一的键盘事件处理函数
 */
export function handleTimelineKeydown(e) {
  if (!state.trajectoryData || !state.trajectoryData.events) return;

  let newIndex = state.currentEventIndex;
  let handled = false;

  switch (e.key) {
    case "ArrowLeft":
    case "ArrowDown":
      newIndex = Math.max(0, state.currentEventIndex - 1);
      handled = true;
      break;
    case "ArrowRight":
    case "ArrowUp":
      newIndex = Math.min(
        state.trajectoryData.events.length - 1,
        state.currentEventIndex + 1
      );
      handled = true;
      break;
    case "Home":
      newIndex = 0;
      handled = true;
      break;
    case "End":
      if (state.isPoetryAnimationPlaying) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      showPoetryMessage();
      return;
    case " ":
      e.preventDefault();
      togglePlay();
      return;
  }

  if (handled) {
    e.preventDefault();
    if (newIndex !== state.currentEventIndex) {
      showEventAtIndex(newIndex, true, true);
    }
  }
}

/**
 * 获取速度标签
 */
export function getSpeedLabel(speed) {
  return SPEED_LABELS[speed] || `${speed}ms`;
}

/**
 * 更新播放速度UI
 */
export function updateSpeedUI() {
  const speedSelect = document.getElementById("custom-speed-select");
  if (speedSelect) {
    speedSelect.dataset.value = state.currentPlaySpeed.toString();
    const selectText = speedSelect.querySelector(".select-text");
    if (selectText) {
      selectText.textContent = getSpeedLabel(state.currentPlaySpeed);
    }
  }
}

/**
 * 复制当前事件数据到剪贴板
 */
export function copyCurrentEventData() {
  if (!state.trajectoryData || !state.trajectoryData.events || state.currentEventIndex < 0) {
    showTemporaryMessage("当前没有可复制的事件数据", "warning");
    return;
  }

  try {
    const currentEvent = state.trajectoryData.events[state.currentEventIndex];

    const cleanEventData = {
      date: currentEvent.date,
      age: currentEvent.age,
      movementType: currentEvent.movementType,
      event: currentEvent.event,
      coordinates: currentEvent.coordinates,
      verification: currentEvent.verification || "",
      userVerification: currentEvent.userVerification || [],
    };

    if (cleanEventData.userVerification.length === 0) {
      cleanEventData.userVerification = [
        {
          username: "考据者署名 (可选)",
          comment: "考据补充或感言 (可选)",
          date: "考据日期 (可选)",
        },
      ];
    }

    const jsonString = JSON.stringify(cleanEventData, null, 2);
    const formattedJson = `    ${jsonString.replace(/\n/g, "\n    ")},`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(formattedJson)
        .then(() => {
          const eventNumber = state.currentEventIndex + 1;
          showTemporaryMessage(
            `事件 ${eventNumber} 数据已复制到剪贴板`,
            "success"
          );
        })
        .catch(() => {
          fallbackCopyToClipboard(
            formattedJson,
            () => {
              const eventNumber = state.currentEventIndex + 1;
              showTemporaryMessage(
                `事件 ${eventNumber} 数据已复制到剪贴板`,
                "success"
              );
            },
            () => {
              showTemporaryMessage("复制失败，请手动选择并复制", "warning");
            }
          );
        });
    } else {
      fallbackCopyToClipboard(
        formattedJson,
        () => {
          const eventNumber = state.currentEventIndex + 1;
          showTemporaryMessage(
            `事件 ${eventNumber} 数据已复制到剪贴板`,
            "success"
          );
        },
        () => {
          showTemporaryMessage("复制失败，请手动选择并复制", "warning");
        }
      );
    }
  } catch (error) {
    console.error("复制事件数据时出错:", error);
    showTemporaryMessage("复制失败，请重试", "warning");
  }
}

