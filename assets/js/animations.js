/*!
 * 动画设置控制模块
 */

import { state } from "./state.js";
import { CAMERA_SPEED_LEVELS } from "./config.js";
import { togglePlay, updateSpeedUI } from "./controls.js";

/**
 * 初始化动画控制滑块
 */
export function initAnimationControls() {
  const pathDurationSlider = document.getElementById("path-duration");
  const pathDurationDisplay = document.getElementById("path-duration-display");
  const cameraSpeedSlider = document.getElementById("camera-speed-slider");
  const cameraSpeedDisplay = document.getElementById("camera-speed-display");

  if (pathDurationSlider && pathDurationDisplay) {
    pathDurationSlider.value = state.animationConfig.pathDuration;
    pathDurationDisplay.textContent =
      (state.animationConfig.pathDuration / 1000).toFixed(1) + "s";

    pathDurationSlider.addEventListener("input", (e) => {
      const newDuration = parseInt(e.target.value);
      state.animationConfig.pathDuration = newDuration;

      if (state.currentPlaySpeed < newDuration) {
        state.currentPlaySpeed = newDuration + 500;
        updateSpeedUI();
      }

      pathDurationDisplay.textContent = (newDuration / 1000).toFixed(1) + "s";
      updateAnimationDuration(newDuration);
    });
  }

  if (cameraSpeedSlider && cameraSpeedDisplay) {
    let savedSpeedLevel = 1;
    try {
      const saved = localStorage.getItem("cameraSpeedLevel");
      if (saved !== null) {
        savedSpeedLevel = parseInt(saved);
        if (
          savedSpeedLevel < 0 ||
          savedSpeedLevel >= CAMERA_SPEED_LEVELS.length
        ) {
          savedSpeedLevel = 1;
        }
      }
    } catch (error) {
      console.warn("无法读取镜头速度设置:", error);
    }

    cameraSpeedSlider.value = savedSpeedLevel;
    updateCameraSpeed(savedSpeedLevel);

    cameraSpeedSlider.addEventListener("input", (e) => {
      const levelIndex = parseInt(e.target.value);
      updateCameraSpeed(levelIndex);

      try {
        localStorage.setItem("cameraSpeedLevel", levelIndex.toString());
      } catch (error) {
        console.warn("无法保存镜头速度设置:", error);
      }
    });
  }
}

/**
 * 更新镜头速度配置
 */
function updateCameraSpeed(levelIndex) {
  if (levelIndex < 0 || levelIndex >= CAMERA_SPEED_LEVELS.length) {
    console.warn("无效的镜头速度档位:", levelIndex);
    return;
  }

  const speedConfig = CAMERA_SPEED_LEVELS[levelIndex];
  const cameraSpeedDisplay = document.getElementById("camera-speed-display");

  state.animationConfig.cameraFollowDuration = speedConfig.cameraFollowDuration;
  state.animationConfig.cameraPanDuration = speedConfig.cameraPanDuration;

  if (cameraSpeedDisplay) {
    cameraSpeedDisplay.textContent = speedConfig.name;
  }

  console.log(`镜头跟随速度已调整为: ${speedConfig.name}`, {
    跟随时长: speedConfig.cameraFollowDuration + "ms",
    平移时长: speedConfig.cameraPanDuration + "ms",
  });
}

/**
 * 更新动画时长配置
 */
function updateAnimationDuration(duration) {
  document.documentElement.style.setProperty(
    "--path-animation-duration",
    duration + "ms"
  );
}

/**
 * 统一设置播放速度，并自动调整路径动画时长
 */
export function setGlobalPlaySpeed(speed) {
  state.currentPlaySpeed = speed;

  // 自动调整路径动画时长，确保小于播放间隔
  // 逻辑：保留 300ms 缓冲，最小 200ms
  // 例如：速度 1000ms -> 动画 700ms
  const newPathDuration = Math.max(200, speed - 300);
  state.animationConfig.pathDuration = newPathDuration;
  updateAnimationDuration(newPathDuration);

  // 同步到滑块 UI (如果在调试面板中存在)
  const pathDurationSlider = document.getElementById("path-duration");
  const pathDurationDisplay = document.getElementById("path-duration-display");
  if (pathDurationSlider && pathDurationDisplay) {
    pathDurationSlider.value = newPathDuration;
    pathDurationDisplay.textContent = (newPathDuration / 1000).toFixed(1) + "s";
  }

  // 如果正在播放，重启播放以立即应用新速度
  if (state.isPlaying) {
    togglePlay();
    setTimeout(() => togglePlay(), 100);
  }
}

/**
 * 初始化自定义速度选择器
 */
export function initCustomSpeedSelect() {
  const customSelects = document.querySelectorAll(".custom-select");
  
  customSelects.forEach(customSelect => {
    initSingleCustomSelect(customSelect);
  });
}

function initSingleCustomSelect(customSelect) {
  const selectDisplay = customSelect.querySelector(".select-display");
  const selectText = customSelect.querySelector(".select-text");
  const selectDropdown = customSelect.querySelector(".select-dropdown");
  const selectOptions = customSelect.querySelectorAll(".select-option");

  let isOpen = false;

  function openDropdown() {
    if (isOpen) {
      return;
    }

    // Close other dropdowns first
    document.querySelectorAll(".custom-select.open").forEach(el => {
      if (el !== customSelect) {
        el.classList.remove("open");
      }
    });

    isOpen = true;
    customSelect.classList.add("open");

    setTimeout(() => {
      document.addEventListener("click", handleDocumentClick);
    }, 0);
  }

  function closeDropdown() {
    if (!isOpen) {
      return;
    }

    isOpen = false;
    customSelect.classList.remove("open");
    document.removeEventListener("click", handleDocumentClick);
  }

  function handleDocumentClick(e) {
    if (!customSelect.contains(e.target)) {
      closeDropdown();
    }
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function selectOption(option) {
    const value = option.dataset.value;
    const text = option.textContent;

    // update UI for ALL selects to keep them in sync
    document.querySelectorAll(".custom-select").forEach(sel => {
        const txt = sel.querySelector(".select-text");
        if (txt) txt.textContent = text;
        sel.dataset.value = value;
        
        const opts = sel.querySelectorAll(".select-option");
        opts.forEach((opt) => opt.classList.remove("selected"));
        
        // find matching option in this select
        const matchingOpt = Array.from(opts).find(o => o.dataset.value === value);
        if (matchingOpt) matchingOpt.classList.add("selected");
    });

    setGlobalPlaySpeed(parseInt(value));

    closeDropdown();
  }

  if (selectDisplay) {
    selectDisplay.addEventListener("click", toggleDropdown);
  }

  selectOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      selectOption(option);
    });
  });

  customSelect.addEventListener("keydown", (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
    } else {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          closeDropdown();
          break;
        case "ArrowUp":
          e.preventDefault();
          navigateOptions(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          navigateOptions(1);
          break;
        case "Enter":
          e.preventDefault();
          const selectedOption = selectDropdown.querySelector(
            ".select-option.selected"
          );
          if (selectedOption) {
            selectOption(selectedOption);
          }
          break;
      }
    }
  });

  function navigateOptions(direction) {
    const options = Array.from(selectOptions);
    const currentIndex = options.findIndex((opt) =>
      opt.classList.contains("selected")
    );
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      newIndex = options.length - 1;
    }
    if (newIndex >= options.length) {
      newIndex = 0;
    }

    options.forEach((opt) => opt.classList.remove("selected"));
    options[newIndex].classList.add("selected");
  }

  customSelect.setAttribute("tabindex", "0");

  const initialValue = customSelect.dataset.value || "3000";
  const initialOption = customSelect.querySelector(
    `[data-value="${initialValue}"]`
  );
  if (initialOption) {
    selectText.textContent = initialOption.textContent;
    selectOptions.forEach((opt) => opt.classList.remove("selected"));
    initialOption.classList.add("selected");
  }
}

