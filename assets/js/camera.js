/*!
 * 镜头控制模块
 */

import { state } from './state.js';
import { calculatePathBounds } from './map.js';

/**
 * 处理镜头跟随逻辑
 */
export function handleCameraFollow(currentEvent, previousIndex, animated = true) {
  if (!currentEvent) return;

  const bounds = calculatePathBounds(currentEvent, previousIndex);
  if (bounds && bounds.isValid()) {
    const panOptions = {
      animate: animated,
      duration: animated ? state.animationConfig.cameraFollowDuration / 1000 : 0,
      paddingTopLeft: [50, 50],
      paddingBottomRight: [50, 100],
      maxZoom: 8,
      easeLinearity: 0.5,
    };

    state.map.fitBounds(bounds, panOptions);
  } else if (currentEvent.endCoords) {
    const [lng, lat] = currentEvent.endCoords;
    const panOptions = {
      animate: animated,
      duration: animated ? state.animationConfig.cameraPanDuration / 1000 : 0,
      easeLinearity: 0.5,
    };
    state.map.setView([lat, lng], Math.max(state.map.getZoom(), 6), panOptions);
  }
}

/**
 * 切换镜头跟随状态
 */
export function toggleCameraFollow() {
  state.isCameraFollowEnabled = !state.isCameraFollowEnabled;
  updateCameraFollowUI();

  try {
    localStorage.setItem(
      "cameraFollowEnabled",
      state.isCameraFollowEnabled.toString()
    );
  } catch (error) {
    console.warn("无法保存镜头跟随设置:", error);
  }
}

/**
 * 更新镜头跟随UI状态
 */
export function updateCameraFollowUI() {
  const cameraSwitch = document.getElementById("camera-follow-switch");
  const cameraStatus = document.getElementById("camera-follow-status");

  if (cameraSwitch) {
    if (state.isCameraFollowEnabled) {
      cameraSwitch.classList.add("active");
    } else {
      cameraSwitch.classList.remove("active");
    }
  }

  if (cameraStatus) {
    cameraStatus.textContent = state.isCameraFollowEnabled ? "开启" : "关闭";
  }
}

/**
 * 初始化镜头跟随控制
 */
export function initCameraFollowControl() {
  try {
    const saved = localStorage.getItem("cameraFollowEnabled");
    if (saved !== null) {
      state.isCameraFollowEnabled = saved === "true";
    }
  } catch (error) {
    console.warn("无法读取镜头跟随设置:", error);
  }

  const cameraSwitch = document.getElementById("camera-follow-switch");
  if (cameraSwitch) {
    cameraSwitch.addEventListener("click", toggleCameraFollow);
  }

  updateCameraFollowUI();
}

