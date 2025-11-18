/*!
 * 路径创建和动画模块
 */

import { state } from './state.js';
import { updateEventMarkers } from './markers.js';
import { updateCurrentEventInfo, updateProgress } from './ui-updates.js';
import { handleCameraFollow } from './camera.js';
import { ensureMarkersInteractivity } from './map.js';

/**
 * 创建 motion 动画路径
 */
export function createMotionPath(
  fromCoords,
  toCoords,
  transitCoords = [],
  isLatest = false,
  eventIndex = null,
  isConnectionPath = false,
  isReverse = false
) {
  if (!fromCoords || !toCoords) return null;

  const pathCoords = [];

  if (isReverse) {
    pathCoords.push([toCoords[1], toCoords[0]]);

    if (!isConnectionPath && transitCoords && transitCoords.length > 0) {
      for (let i = transitCoords.length - 1; i >= 0; i--) {
        pathCoords.push([transitCoords[i][1], transitCoords[i][0]]);
      }
    }

    pathCoords.push([fromCoords[1], fromCoords[0]]);
  } else {
    pathCoords.push([fromCoords[1], fromCoords[0]]);

    if (!isConnectionPath && transitCoords && transitCoords.length > 0) {
      transitCoords.forEach((coords) => {
        pathCoords.push([coords[1], coords[0]]);
      });
    }

    pathCoords.push([toCoords[1], toCoords[0]]);
  }

  const polylineOptions = {
    color: isLatest ? "#c0392b" : "#85c1e9",
    weight: isConnectionPath ? 2 : 3,
    opacity: isLatest ? 0.9 : isConnectionPath ? 0.4 : 0.6,
    smoothFactor: 1,
    dashArray: isConnectionPath ? "4, 8" : "8, 8",
  };

  let effectiveDuration = state.isDragging ? 1 : state.animationConfig.pathDuration;

  const motionOptions = {
    auto: state.isDragging ? true : false,
    duration: effectiveDuration,
    easing: state.isDragging
      ? L.Motion.Ease.easeLinear || state.animationConfig.motionOptions.easing
      : state.animationConfig.motionOptions.easing,
  };

  const motionPath = L.motion.polyline(
    pathCoords,
    polylineOptions,
    motionOptions
  );

  motionPath._isAnimated = true;
  motionPath._isLatest = isLatest;
  motionPath._needsAnimation = isLatest && !state.isDragging;
  motionPath._eventIndex = eventIndex;
  motionPath._isConnectionPath = isConnectionPath;
  motionPath._isReverse = isReverse;
  motionPath._originalPathCoords = pathCoords;
  motionPath._pathOptions = polylineOptions;

  return motionPath;
}

/**
 * 更新路径样式
 */
export function updatePathStyle(path, isLatest) {
  if (!path) return;

  const color = isLatest ? "#c0392b" : "#85c1e9";
  const opacity = isLatest ? 0.9 : 0.6;

  path.setStyle({
    color: color,
    opacity: opacity,
    dashArray: "8, 8",
  });

  path._isLatest = isLatest;

  if (path._path) {
    path._path.style.stroke = color;
    path._path.style.strokeOpacity = opacity;
  }
}

/**
 * 静态更新路径（无动画）
 */
export function updatePathsStatic(targetIndex) {
  state.pathLayers.forEach((path) => {
    if (path._map) {
      state.map.removeLayer(path);
    }
  });
  state.pathLayers = [];
  state.motionPaths.clear();

  for (let i = 0; i <= targetIndex; i++) {
    const currentEvent = state.trajectoryData.events[i];

    if (
      currentEvent.startCoords &&
      currentEvent.endCoords &&
      currentEvent.movementType !== "原地活动"
    ) {
      console.log(
        `${state.isDragging ? "拖动" : "静态"}添加路径: 事件 ${i}: ${
          currentEvent.event
        }`
      );

      const isLatest = i === targetIndex;
      const motionPath = createMotionPath(
        currentEvent.startCoords,
        currentEvent.endCoords,
        currentEvent.transitCoords,
        isLatest,
        i,
        false,
        false
      );

      if (motionPath) {
        motionPath._needsAnimation = false;
        motionPath._initiallyHidden = false;
        motionPath.addTo(state.map);
        state.pathLayers.push(motionPath);
        state.motionPaths.set(i, motionPath);

        if (state.isDragging && motionPath.motionStart) {
          motionPath.motionStart();
        }

        console.log(`成功添加${state.isDragging ? "拖动" : "静态"}路径: 事件 ${i}`);
      } else {
        console.warn(`路径创建失败: 事件 ${i}`);
      }
    } else {
      console.log(`跳过事件 ${i}: ${currentEvent.event} (原地活动或缺少坐标)`);
    }
  }
}

/**
 * 创建路径消失动画
 */
export function animatePathDisappear(path) {
  if (!path || !path._map) return;

  const pathElement = path._path;
  if (!pathElement) {
    state.map.removeLayer(path);
    return;
  }

  const totalLength = pathElement.getTotalLength();

  pathElement.style.strokeDasharray = totalLength;
  pathElement.style.strokeDashoffset = "0";
  pathElement.style.transition = `stroke-dashoffset ${state.animationConfig.pathDuration}ms ease-in-out, opacity ${state.animationConfig.pathDuration}ms ease-in-out`;

  setTimeout(() => {
    pathElement.style.strokeDashoffset = totalLength;
    pathElement.style.opacity = "0";
  }, 50);

  setTimeout(() => {
    if (path._map) {
      state.map.removeLayer(path);
    }
  }, state.animationConfig.pathDuration + 100);
}

/**
 * 批量执行路径消失动画
 */
export function batchAnimatePathsDisappear(paths, staggerDelay = 200) {
  if (!paths || paths.length === 0) return;

  return new Promise((resolve) => {
    let completedCount = 0;
    const totalPaths = paths.length;

    paths.forEach((path, index) => {
      setTimeout(() => {
        animatePathDisappear(path);

        completedCount++;
        if (completedCount === totalPaths) {
          setTimeout(() => {
            resolve();
          }, state.animationConfig.pathDuration + 100);
        }
      }, index * staggerDelay);
    });
  });
}

/**
 * 动画更新路径
 */
export function updatePathsAnimated(targetIndex, isReverse = false) {
  if (isReverse) {
    const pathsToRemove = state.pathLayers.filter(
      (path) => path._eventIndex > targetIndex
    );

    if (pathsToRemove.length > 0) {
      console.log(`开始反向消失动画，移除 ${pathsToRemove.length} 条路径`);

      pathsToRemove.forEach((path, index) => {
        setTimeout(() => {
          animatePathDisappear(path);
        }, index * 100);
      });

      setTimeout(() => {
        pathsToRemove.forEach((pathToRemove) => {
          const pathIndex = state.pathLayers.indexOf(pathToRemove);
          if (pathIndex > -1) {
            state.pathLayers.splice(pathIndex, 1);
          }
          if (state.motionPaths.has(pathToRemove._eventIndex)) {
            state.motionPaths.delete(pathToRemove._eventIndex);
          }
        });
      }, pathsToRemove.length * 200 + state.animationConfig.pathDuration);
    }
  } else {
    const currentEvent = state.trajectoryData.events[targetIndex];

    state.pathLayers.forEach((path) => {
      if (path._isLatest) {
        updatePathStyle(path, false);
      }
    });

    if (
      currentEvent.startCoords &&
      currentEvent.endCoords &&
      currentEvent.movementType !== "原地活动"
    ) {
      console.log(
        `Motion 添加路径: 事件 ${targetIndex} - ${currentEvent.event}`
      );

      const motionPath = createMotionPath(
        currentEvent.startCoords,
        currentEvent.endCoords,
        currentEvent.transitCoords,
        true,
        targetIndex,
        false,
        false
      );

      if (motionPath) {
        motionPath.addTo(state.map);
        state.pathLayers.push(motionPath);
        state.motionPaths.set(targetIndex, motionPath);

        motionPath.motionStart();
      }
    }
  }
}

/**
 * 显示指定索引的事件
 */
export function showEventAtIndex(index, animated = true, isUserDrag = false) {
  if (!state.trajectoryData || index >= state.trajectoryData.events.length || index < 0)
    return;
  if (state.animationConfig.isAnimating && !isUserDrag) return;

  const isMovingForward = index > state.currentEventIndex;
  const isMovingBackward = index < state.currentEventIndex;

  state.previousEventIndex = state.currentEventIndex;
  state.currentEventIndex = index;
  const event = state.trajectoryData.events[index];

  if (animated && (isMovingForward || isMovingBackward)) {
    state.animationConfig.isAnimating = true;
    setTimeout(() => {
      state.animationConfig.isAnimating = false;
    }, state.animationConfig.pathDuration + 100);
  }

  updateCurrentEventInfo(event);
  updateProgress();
  updateEventMarkers(index);

  if (animated && (isMovingForward || isMovingBackward)) {
    updatePathsAnimated(index, isMovingBackward);
  } else {
    updatePathsStatic(index);
  }

  if (state.isCameraFollowEnabled) {
    handleCameraFollow(event, state.previousEventIndex, animated);
  }

  if (animated) {
    setTimeout(() => {
      ensureMarkersInteractivity();
    }, state.animationConfig.pathDuration + 100);
  }
}

