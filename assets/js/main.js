/*!
 * 苏轼与徐霞客行迹图 - 主入口文件
 * Author: https://github.com/Jaxon1216
 * GitHub: https://github.com/Jaxon1216
 */

import { state } from "./state.js";
import { isMobileDevice, hideLoading } from "./utils.js";
import { initMap } from "./map.js";
import { loadGeographicData, loadTrajectoryData } from "./data-loader.js";
import { showEventAtIndex } from "./paths.js";
import { updateStatistics, updateTimeRange } from "./ui-updates.js";
import { bindEvents } from "./events.js";
import { forceStopPoetryAnimation } from "./poetry.js";
import { initRightPanel, initPanelAfterDataLoad } from "./right-panel.js";
import {
  checkMotionPlugin,
  cleanupMotionResources,
  optimizeMotionPerformance,
  preloadKeyAnimations,
  monitorMotionPerformance
} from "./performance.js";
import { initNavigation, getActiveNavConfig } from "./navigation.js";

/**
 * 重新加载应用数据（用于导航切换）
 */
async function reloadAppData(navConfig) {
  console.log("开始重新加载数据:", navConfig.name);

  // 停止当前播放
  if (state.isPlaying) {
    state.isPlaying = false;
    if (state.playInterval) {
      clearTimeout(state.playInterval);
      state.playInterval = null;
    }
  }

  // 清理现有的地图图层和标记
  if (state.map) {
    state.map.eachLayer((layer) => {
      // 只保留底图瓦片图层，移除其他图层（标记、路径等）
      if (!(layer instanceof L.TileLayer) && !(layer instanceof L.LayerGroup)) {
        state.map.removeLayer(layer);
      }
    });
  }

  // 清空状态
  state.eventMarkers = [];
  state.pathLayers = [];
  state.locationMarkers.clear();
  state.locationGroups.clear();
  state.motionPaths.clear();
  state.currentEventIndex = 0;
  state.currentMotionLayer = null;

  // 加载新数据
  state.trajectoryData = await loadTrajectoryData(navConfig.dataFile);

  if (state.trajectoryData && state.trajectoryData.events.length > 0) {
    // 更新时间轴滑块
    const slider = document.getElementById("timeline-slider");
    if (slider) {
      slider.max = state.trajectoryData.events.length - 1;
      slider.value = 0;
    }

    // 更新事件总数显示
    const totalCountEls = document.querySelectorAll("[id^='total-event-count']");
    totalCountEls.forEach((el) => {
      if (el) {
        el.textContent = state.trajectoryData.events.length;
      }
    });

    // 更新统计信息
    updateStatistics();

    // 更新时间范围显示
    updateTimeRange();

    // 重新初始化右侧面板
    initPanelAfterDataLoad();

    // 显示第一个事件
    showEventAtIndex(0, false);

    // 更新播放按钮状态
    const playBtn = document.getElementById("play-btn");
    if (playBtn) {
      playBtn.textContent = "▶";
      playBtn.title = "播放";
    }

    hideLoading();
    console.log("数据重新加载完成");
  } else {
    throw new Error("轨迹数据为空");
  }
}

/**
 * 初始化应用
 */
async function initApp() {
  try {
    // 初始化导航栏
    initNavigation();

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

    // 获取当前激活的导航配置
    const activeNavConfig = getActiveNavConfig();
    console.log("加载数据配置:", activeNavConfig.name, activeNavConfig.dataFile);

    // 使用配置中的数据文件加载
    state.trajectoryData = await loadTrajectoryData(activeNavConfig.dataFile);

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

      // 更新时间范围显示
      updateTimeRange();

      // 初始化右侧面板
      initRightPanel();
      initPanelAfterDataLoad();

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

    // 监听导航切换事件
    window.addEventListener("navigationChanged", async (e) => {
      const navConfig = e.detail.navConfig;
      console.log("接收到导航切换事件:", navConfig.name);

      try {
        // 重新加载数据
        await reloadAppData(navConfig);
      } catch (error) {
        console.error("重新加载数据失败:", error);
        alert(`加载失败: ${error.message}`);
        hideLoading();
      }
    });

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

    // 初始化引导弹窗逻辑
    const modal = document.getElementById('intro-modal');
    const startBtn = document.getElementById('start-journey-btn');
    const helpBtn = document.getElementById('help-btn');

    if (modal && startBtn) {
      // 点击开始按钮关闭弹窗
      startBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    if (helpBtn && modal) {
      // 点击帮助按钮显示弹窗
      helpBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }
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

