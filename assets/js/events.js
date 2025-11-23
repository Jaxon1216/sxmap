/*!
 * 事件绑定模块
 */

import { state } from "./state.js";
import { isMobileDevice } from "./utils.js";
import { togglePlay, previousEvent, nextEvent, handleTimelineKeydown, copyCurrentEventData } from "./controls.js";
import { showEventAtIndex } from "./paths.js";
import { initAnimationControls, initCustomSpeedSelect } from "./animations.js";
import { initDetailPanel } from "./panels.js";
import { initMobileInteractions } from "./mobile.js";
import { initCameraFollowControl } from "./camera.js";

/**
 * 绑定所有事件监听器
 */
export function bindEvents() {
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const fullRouteBtn = document.getElementById("full-route-btn");

  if (playBtn) {
    playBtn.addEventListener("click", togglePlay);
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", previousEvent);
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", nextEvent);
  }
  
  // 绑定全局路线按钮点击事件
  if (fullRouteBtn) {
    fullRouteBtn.addEventListener("click", () => {
      if (state.trajectoryData && state.trajectoryData.events.length > 0) {
        const lastIndex = state.trajectoryData.events.length - 1;
        
        // 停止播放
        if (state.isPlaying) {
          togglePlay();
        }
        
        // 临时设置 isDragging 为 true，以利用其“快速/瞬间显示路径”的逻辑
        // 这样 createMotionPath 会使用极短的 duration，且 updatePathsStatic 会自动调用 motionStart
        const wasDragging = state.isDragging;
        state.isDragging = true;

        // 跳转到最后一个事件
        showEventAtIndex(lastIndex, false, true);
        
        // 恢复状态
        state.isDragging = wasDragging;
        
        // 调整视角以显示完整轨迹
        setTimeout(() => {
          if (state.map && state.locationMarkers.size > 0) {
            const markers = Array.from(state.locationMarkers.values());
            if (markers.length > 0) {
              const group = L.featureGroup(markers);
              state.map.fitBounds(group.getBounds(), {
                padding: [50, 50],
                maxZoom: 8
              });
            }
          }
        }, 500); // 稍微延迟以等待标记和路径更新
      }
    });
  }

  const slider = document.getElementById("timeline-slider");
  if (slider) {
    slider.addEventListener("mousedown", () => {
      state.isDragging = true;
      console.log("开始拖动 (mousedown)");
    });

    slider.addEventListener("touchstart", () => {
      state.isDragging = true;
      console.log("开始拖动 (touchstart)");
    });

    slider.addEventListener("mouseup", () => {
      if (state.isDragging) {
        state.isDragging = false;
        console.log("结束拖动 (mouseup)");
        const finalIndex = parseInt(slider.value);
        if (finalIndex !== state.currentEventIndex) {
          showEventAtIndex(finalIndex, true, true);
        }
      }
    });

    slider.addEventListener("touchend", () => {
      if (state.isDragging) {
        state.isDragging = false;
        console.log("结束拖动 (touchend)");
        const finalIndex = parseInt(slider.value);
        if (finalIndex !== state.currentEventIndex) {
          showEventAtIndex(finalIndex, true, true);
        }
      }
    });

    slider.addEventListener("input", (e) => {
      if (state.trajectoryData) {
        const newIndex = parseInt(e.target.value);
        console.log(`滑块输入: ${newIndex}, 拖动状态: ${state.isDragging}`);

        if (state.isDragging) {
          showEventAtIndex(newIndex, false, true);
        } else {
          showEventAtIndex(newIndex, true, true);
        }
      }
    });

    slider.addEventListener("dblclick", (e) => {
      e.preventDefault();
      copyCurrentEventData();
    });

    slider.addEventListener("keydown", (e) => {
      handleTimelineKeydown(e);
    });

    slider.addEventListener("focus", () => {
      slider.style.outline = "none";
    });

    slider.addEventListener("click", () => {
      slider.focus();
    });
  }

  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    const isInputElement =
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT" ||
        activeElement.contentEditable === "true");

    const detailPanel = document.getElementById("location-detail-panel");
    const isPanelVisible =
      detailPanel && detailPanel.classList.contains("visible");

    if (!isInputElement && !isPanelVisible) {
      handleTimelineKeydown(e);
    }
  });

  const speedSelect = document.getElementById("speed-select");
  if (speedSelect) {
    speedSelect.addEventListener("change", (e) => {
      state.currentPlaySpeed = parseInt(e.target.value);
      if (state.isPlaying) {
        togglePlay();
        setTimeout(() => togglePlay(), 100);
      }
    });
  }
  initCustomSpeedSelect();

  const speedBtns = document.querySelectorAll(".speed-btn");
  speedBtns.forEach((btn) => {
    btn.addEventListener("click", (_e) => {
      speedBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentPlaySpeed = parseInt(btn.dataset.speed);

      if (state.isPlaying) {
        togglePlay();
        setTimeout(() => togglePlay(), 100);
      }
    });
  });

  initAnimationControls();
  initDetailPanel();
  initMobileInteractions();
  initCameraFollowControl();

  window.addEventListener("resize", () => {
    const mapEl = document.getElementById("map");
    if (isMobileDevice()) {
      if (state.isPanelVisible) {
        mapEl.classList.remove("panel-hidden");
        mapEl.classList.add("panel-visible");
      } else {
        mapEl.classList.remove("panel-visible");
        mapEl.classList.add("panel-hidden");
      }
    } else {
      mapEl.classList.remove("panel-hidden", "panel-visible");
      state.isPanelVisible = true;
      document.getElementById("timeline-control").classList.remove("hidden");
    }
  });
}
