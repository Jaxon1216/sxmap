/*!
 * 性能优化模块
 */

import { state } from "./state.js";
import { isMobileDevice } from "./utils.js";
import { batchAnimatePathsDisappear, createMotionPath } from "./paths.js";

/**
 * 检查 leaflet.motion 插件是否正确加载
 */
export function checkMotionPlugin() {
  if (
    typeof L.motion !== "undefined" &&
    typeof L.motion.polyline === "function"
  ) {
    console.log("✅ leaflet.motion 插件加载成功");
    return true;
  } else {
    console.error("❌ leaflet.motion 插件未正确加载");
    return false;
  }
}

/**
 * 清理 motion 资源
 */
export function cleanupMotionResources() {
  const allPaths = Array.from(state.motionPaths.values());

  if (allPaths.length > 0) {
    batchAnimatePathsDisappear(allPaths, 100)
      .then(() => {
        state.motionPaths.clear();
        state.pathLayers = [];
        state.animationQueue = [];
        state.isAnimationInProgress = false;

        console.log("Motion 资源清理完成");
      })
      .catch((error) => {
        console.warn("Motion 资源清理失败:", error);
        state.motionPaths.forEach((path) => {
          if (path && path._map) {
            try {
              path.motionStop();
              state.map.removeLayer(path);
            } catch (e) {
              console.warn("强制清理路径失败:", e);
            }
          }
        });

        state.motionPaths.clear();
        state.pathLayers = [];
        state.animationQueue = [];
        state.isAnimationInProgress = false;
      });
  } else {
    state.motionPaths.clear();
    state.animationQueue = [];
    state.isAnimationInProgress = false;
    console.log("Motion 资源清理完成");
  }
}

/**
 * 预加载关键路径动画
 */
export function preloadKeyAnimations() {
  if (!state.trajectoryData || !state.trajectoryData.events) {
    return;
  }

  const keyEvents = state.trajectoryData.events.slice(
    0,
    Math.min(10, state.trajectoryData.events.length)
  );

  keyEvents.forEach((event, index) => {
    if (
      event.startCoords &&
      event.endCoords &&
      event.movementType !== "原地活动"
    ) {
      const preloadPath = createMotionPath(
        event.startCoords,
        event.endCoords,
        event.transitCoords,
        false,
        index,
        false,
        false
      );

      if (preloadPath) {
        preloadPath.addTo(state.map);
        preloadPath.setStyle({ opacity: 0 });

        setTimeout(() => {
          if (preloadPath._map) {
            state.map.removeLayer(preloadPath);
          }
        }, 100);
      }
    }
  });

  console.log("关键路径预加载完成");
}

/**
 * 优化 motion 性能配置
 */
export function optimizeMotionPerformance() {
  if (!state.map || !state.map._renderer) {
    console.warn("地图未完全初始化，跳过性能优化");
    return;
  }

  try {
    const renderer = state.map._renderer;
    if (renderer && renderer._container) {
      const container = renderer._container;

      container.style.willChange = "transform";
      container.style.transform = "translateZ(0)";
      container.style.backfaceVisibility = "hidden";

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeName === "path" && node.getAttribute("stroke")) {
                node.style.willChange = "stroke-dashoffset";
                node.style.transform = "translateZ(0)";
              }
            });
          }
        });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      window.motionObserver = observer;

      console.log("Motion 性能优化已启用");
    }
  } catch (error) {
    console.warn("Motion 性能优化失败:", error);
  }
}

/**
 * 动态调整 motion 参数
 */
export function dynamicAdjustMotionParams() {
  const pathCount = state.motionPaths.size;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const isMobile = isMobileDevice();

  let durationMultiplier = 1;

  if (pathCount > 20) {
    durationMultiplier = 0.7;
  } else if (pathCount > 10) {
    durationMultiplier = 0.85;
  }

  if (isMobile) {
    durationMultiplier *= 0.8;
  }

  if (devicePixelRatio > 2) {
    durationMultiplier *= 0.9;
  }

  state.animationConfig.pathDuration = Math.max(
    1000,
    state.animationConfig.pathDuration * durationMultiplier
  );
}

/**
 * 监听性能指标
 */
export function monitorMotionPerformance() {
  let frameCount = 0;
  let lastTime = Date.now();
  let isMonitoring = false;

  function measureFPS() {
    if (!isMonitoring) {
      return;
    }

    frameCount++;
    const currentTime = Date.now();

    if (currentTime - lastTime >= 1000) {
      const fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;

      if (fps < 30 && state.motionPaths.size > 0) {
        console.warn("Motion 性能较低，自动调整参数");
        dynamicAdjustMotionParams();
      }

      if (state.motionPaths.size > 0) {
        console.log(
          `Motion 性能监控 - FPS: ${fps}, 路径数量: ${state.motionPaths.size}`
        );
      }
    }

    if (state.motionPaths.size > 0 && isMonitoring) {
      requestAnimationFrame(measureFPS);
    }
  }

  isMonitoring = true;
  if (state.motionPaths.size > 0) {
    requestAnimationFrame(measureFPS);
  }

  return {
    stop: () => {
      isMonitoring = false;
    },
  };
}

