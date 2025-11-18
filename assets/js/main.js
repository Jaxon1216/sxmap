/*!
 * 毛泽东生平地理轨迹可视化 - 主入口文件
 * Author: sansan0
 * GitHub: https://github.com/sansan0/mao-map
 */

import { state } from "./state.js";
import { isMobileDevice, hideLoading } from "./utils.js";
import { initMap } from "./map.js";
import { loadGeographicData, loadTrajectoryData } from "./data-loader.js";
import { showEventAtIndex } from "./paths.js";
import { updateStatistics } from "./ui-updates.js";
import { bindEvents } from "./events.js";
import { forceStopPoetryAnimation } from "./poetry.js";
import {
  checkMotionPlugin,
  cleanupMotionResources,
  optimizeMotionPerformance,
  preloadKeyAnimations,
  monitorMotionPerformance
} from "./performance.js";

/**
 * 初始化应用
 */
async function initApp() {
  try {
    initMap();

    const motionLoaded = checkMotionPlugin();
    if (!motionLoaded) {
      throw new Error(
        "leaflet.motion 插件未正确加载，请确保已正确引入插件文件"
      );
    }

    // 设置 motion easing 函数
    state.animationConfig.motionOptions.easing = L.Motion.Ease.easeInOutQuart;

    // 等待地图完全加载
    await new Promise((resolve) => {
      if (state.map._loaded) {
        resolve();
      } else {
        state.map.on("load", resolve);
        setTimeout(resolve, 2000);
      }
    });

    const geoDataLoaded = await loadGeographicData();
    if (!geoDataLoaded) {
      throw new Error("地理数据加载失败");
    }

    state.trajectoryData = await loadTrajectoryData();

    if (state.trajectoryData && state.trajectoryData.events.length > 0) {
      const slider = document.getElementById("timeline-slider");
      if (slider) {
        slider.max = state.trajectoryData.events.length - 1;
        slider.style.transition = `all ${state.animationConfig.timelineDuration}ms ease`;
      }

      const totalCountEls = document.querySelectorAll(
        "[id^='total-event-count']"
      );
      totalCountEls.forEach((el) => {
        if (el) {
          el.textContent = state.trajectoryData.events.length;
        }
      });

      updateStatistics();
      showEventAtIndex(0, false);

      setTimeout(() => {
        optimizeMotionPerformance();

        if (motionLoaded) {
          preloadKeyAnimations();
        }

        const performanceMonitor = monitorMotionPerformance();
        window.motionPerformanceMonitor = performanceMonitor;
      }, 1500);
    } else {
      throw new Error("轨迹数据为空");
    }

    bindEvents();
    hideLoading();

    const mapEl = document.getElementById("map");
    if (isMobileDevice()) {
      mapEl.classList.add("panel-visible");
    }

    window.addEventListener("beforeunload", () => {
      forceStopPoetryAnimation();

      cleanupMotionResources();
      if (window.motionObserver) {
        window.motionObserver.disconnect();
      }
      if (window.motionPerformanceMonitor) {
        window.motionPerformanceMonitor.stop();
      }
    });

    console.log("leaflet.motion 插件状态:", motionLoaded ? "已加载" : "未加载");
  } catch (error) {
    console.error("应用初始化失败:", error);

    const loading = document.getElementById("loading");
    if (loading) {
      loading.innerHTML = `
        <div class="error">
          <h3>加载失败</h3>
          <p>应用初始化时出现错误，请刷新页面重试。</p>
          <p>错误信息: ${error.message}</p>
        </div>
      `;
    }
  }
}

// 启动应用
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

