/*!
 * 路径高亮功能模块
 */

import { state } from './state.js';

/**
 * 高亮指定事件的路径
 */
export function highlightEventPath(eventIndex) {
  if (
    !state.trajectoryData ||
    eventIndex < 0 ||
    eventIndex >= state.trajectoryData.events.length
  ) {
    return;
  }

  clearPathHighlight();

  const motionPath = state.motionPaths.get(eventIndex);

  if (motionPath && motionPath._map) {
    const originalStyle = {
      color: motionPath.options.color,
      weight: motionPath.options.weight,
      opacity: motionPath.options.opacity,
      dashArray: motionPath.options.dashArray,
    };

    motionPath.setStyle({
      color: "#e74c3c",
      weight: 5,
      opacity: 0.9,
      dashArray: "10, 0",
    });

    motionPath.motionStart();

    state.highlightedPaths.push({
      path: motionPath,
      originalStyle: originalStyle,
    });

    state.currentHighlightedEventIndex = eventIndex;

    if (state.highlightTimeout) {
      clearTimeout(state.highlightTimeout);
    }

    state.highlightTimeout = setTimeout(() => {
      clearPathHighlight();
    }, 4000);

    if (motionPath.getBounds && state.isCameraFollowEnabled) {
      try {
        const bounds = motionPath.getBounds();
        if (bounds.isValid()) {
          state.map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 8,
            animate: true,
            duration: state.animationConfig.cameraFollowDuration / 1000,
            easeLinearity: 0.5,
          });
        }
      } catch (error) {
        console.warn("聚焦路径失败:", error);
      }
    }
  }
}

/**
 * 清除路径高亮
 */
export function clearPathHighlight() {
  if (state.highlightTimeout) {
    clearTimeout(state.highlightTimeout);
    state.highlightTimeout = null;
  }

  state.highlightedPaths.forEach(({ path, originalStyle }) => {
    if (path && path._map) {
      try {
        path.setStyle(originalStyle);
        path.motionStart();
      } catch (error) {
        console.warn("恢复路径样式失败:", error);
      }
    }
  });

  state.highlightedPaths = [];
  state.currentHighlightedEventIndex = -1;
}

/**
 * 快速清除路径高亮
 */
export function quickClearPathHighlight() {
  if (state.highlightTimeout) {
    clearTimeout(state.highlightTimeout);
    state.highlightTimeout = null;
  }

  state.highlightedPaths.forEach(({ path, originalStyle }) => {
    if (path && path._map) {
      try {
        path.setStyle({
          ...originalStyle,
          opacity: originalStyle.opacity * 0.3,
        });

        setTimeout(() => {
          if (path && path._map) {
            path.setStyle(originalStyle);
            path.motionStart();
          }
        }, 200);
      } catch (error) {
        console.warn("快速清除路径高亮失败:", error);
      }
    }
  });

  state.highlightedPaths = [];
  state.currentHighlightedEventIndex = -1;
}

