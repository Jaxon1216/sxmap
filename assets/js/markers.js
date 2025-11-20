/*!
 * 标记创建和管理模块
 */

import { state } from "./state.js";
import { isMobileDevice } from "./utils.js";
import { getCoordinatesWithLocation } from "./coordinates.js";
import { showDetailPanel } from "./panels.js";
import { ensureMarkersInteractivity } from "./map.js";

/**
 * 从完整地点路径中提取最末级城市名
 * 例如："中国 湖南省 长沙市 开福区" -> "开福区"
 * 或："中国 北京市" -> "北京市"
 */
function extractCityName(locationPath) {
  if (!locationPath) {
    return "";
  }

  // 按空格分割路径
  const parts = locationPath.trim().split(/\s+/);

  if (parts.length === 0) {
    return "";
  }

  // 返回最后一级
  let cityName = parts[parts.length - 1];

  // 如果最后一级是区/县，且长度较短，可以考虑保留上一级
  // 例如："开福区" -> "长沙·开福区"
  if (parts.length >= 2 && cityName.length <= 3 && (cityName.endsWith("区") || cityName.endsWith("县"))) {
    const parentCity = parts[parts.length - 2];
    // 去掉"市"、"省"等后缀，简化显示
    const simplifiedParent = parentCity.replace(/[省市]/g, "");
    cityName = `${simplifiedParent}·${cityName}`;
  }

  return cityName;
}

/**
 * 按地理位置聚合事件
 */
export function groupEventsByLocation(events, maxIndex) {
  const groups = new Map();

  for (let i = 0; i <= maxIndex; i++) {
    const event = events[i];

    if (event.movementType === "出生") {
      if (event.endCoords && event.endLocation) {
        const coordKey = `${event.endCoords[0]},${event.endCoords[1]}`;

        if (!groups.has(coordKey)) {
          groups.set(coordKey, {
            coordinates: event.endCoords,
            location: event.endLocation,
            events: [],
            types: new Set(),
          });
        }

        const group = groups.get(coordKey);
        group.events.push({
          ...event,
          index: i,
          date: event.date,
          event: event.event,
          age: event.age,
          visitType: "出生",
        });

        group.types.add(event.movementType);
      }
    } else if (event.movementType === "原地活动") {
      if (event.endCoords && event.endLocation) {
        const coordKey = `${event.endCoords[0]},${event.endCoords[1]}`;

        if (!groups.has(coordKey)) {
          groups.set(coordKey, {
            coordinates: event.endCoords,
            location: event.endLocation,
            events: [],
            types: new Set(),
          });
        }

        const group = groups.get(coordKey);
        group.events.push({
          ...event,
          index: i,
          date: event.date,
          event: event.event,
          age: event.age,
          visitType: "活动",
        });

        group.types.add(event.movementType);
      }
    } else {
      if (event.startCoords && event.startLocation) {
        const coordKey = `${event.startCoords[0]},${event.startCoords[1]}`;

        if (!groups.has(coordKey)) {
          groups.set(coordKey, {
            coordinates: event.startCoords,
            location: event.startLocation,
            events: [],
            types: new Set(),
          });
        }

        const group = groups.get(coordKey);
        group.events.push({
          ...event,
          index: i,
          date: event.date,
          event: event.event,
          age: event.age,
          visitType: "起点",
        });

        group.types.add(event.movementType);
      }

      if (event.endCoords && event.endLocation) {
        const coordKey = `${event.endCoords[0]},${event.endCoords[1]}`;

        if (!groups.has(coordKey)) {
          groups.set(coordKey, {
            coordinates: event.endCoords,
            location: event.endLocation,
            events: [],
            types: new Set(),
          });
        }

        const group = groups.get(coordKey);
        group.events.push({
          ...event,
          index: i,
          date: event.date,
          event: event.event,
          age: event.age,
          visitType: "目的地",
        });

        group.types.add(event.movementType);
      }

      if (
        event.transitCoords &&
        event.transitCoords.length > 0 &&
        event.coordinates &&
        event.coordinates.transit
      ) {
        event.transitCoords.forEach((coords, transitIndex) => {
          if (coords && event.coordinates.transit[transitIndex]) {
            const transitInfo = event.coordinates.transit[transitIndex];
            const transitResult = getCoordinatesWithLocation(transitInfo);

            if (transitResult.coordinates && transitResult.location) {
              const coordKey = `${coords[0]},${coords[1]}`;

              if (!groups.has(coordKey)) {
                groups.set(coordKey, {
                  coordinates: coords,
                  location: transitResult.location,
                  events: [],
                  types: new Set(),
                });
              }

              const group = groups.get(coordKey);
              group.events.push({
                ...event,
                index: i,
                date: event.date,
                event: `途经：${event.event}`,
                age: event.age,
                visitType: "途径",
                originalEvent: event.event,
              });

              group.types.add(event.movementType);
            }
          }
        });
      }
    }
  }

  return groups;
}

/**
 * 根据访问次数获取标记样式类
 */
function getVisitCountClass(visitCount) {
  if (visitCount === 1) {
    return "visits-1";
  }
  if (visitCount === 2) {
    return "visits-2";
  }
  if (visitCount === 3) {
    return "visits-3";
  }
  return "visits-4-plus";
}

/**
 * 根据事件类型获取主要标记类型
 */
function getPrimaryMarkerType(types) {
  if (types.has("出生")) {
    return "marker-birth";
  }
  if (types.has("国际移动")) {
    return "marker-international";
  }
  if (types.has("长途移动")) {
    return "marker-long-distance";
  }
  if (types.has("短途移动")) {
    return "marker-short-distance";
  }

  const movementTypes = ["国际移动", "长途移动", "短途移动"].filter((type) =>
    types.has(type)
  );
  if (movementTypes.length > 1) {
    return "marker-mixed";
  }

  if (types.has("原地活动")) {
    return "marker-activity";
  }

  return "marker-movement";
}

/**
 * 创建地点标记
 */
export function createLocationMarker(
  locationGroup,
  isCurrent = false,
  isVisited = false,
  currentEvent = null
) {
  const { coordinates, location, events, types } = locationGroup;
  const [lng, lat] = coordinates;
  const visitCount = events.length;

  const markerClasses = [
    "location-marker",
    getPrimaryMarkerType(types),
    getVisitCountClass(visitCount),
  ];

  if (isCurrent) {
    markerClasses.push("current");
  }
  if (isVisited) {
    markerClasses.push("visited");
  }

  const markerContent = visitCount > 1 ? visitCount.toString() : "";

  // 为适配 marker.green.png，放大标记尺寸，桌面端稍大一点，移动端略小
  const baseSize = isMobileDevice() ? 28 : 32;
  const iconSizes = {
    1: [baseSize, baseSize],
    2: [baseSize + 6, baseSize + 6],
    3: [baseSize + 12, baseSize + 12],
    4: [baseSize + 18, baseSize + 18],
  };

  const sizeKey = visitCount >= 4 ? 4 : visitCount || 1;
  const iconSize = iconSizes[sizeKey];
  // 让图钉底部尖端落在坐标点附近，稍微下移 anchor
  const iconAnchor = [iconSize[0] / 2, iconSize[1] * 0.85];

  const markerElement = L.divIcon({
    className: markerClasses.join(" "),
    html: markerContent,
    iconSize: iconSize,
    iconAnchor: iconAnchor,
  });

  const marker = L.marker([lat, lng], {
    icon: markerElement,
    interactive: true,
    keyboard: true,
    zIndexOffset: 1000,
  });

  // 添加永久显示的城市名标签
  const cityName = extractCityName(location);
  if (cityName) {
    marker.bindTooltip(cityName, {
      permanent: true,
      direction: "right",
      className: "city-label-tooltip",
      offset: [8, 0],
      opacity: 0.95,
    });
  }

  const clickHandler = function (e) {
    e.originalEvent.stopPropagation();
    showDetailPanel(locationGroup);
  };

  marker._originalClickHandler = clickHandler;
  marker.on("click", clickHandler);

  marker.on("add", function () {
    setTimeout(() => {
      if (marker._icon) {
        marker._icon.style.zIndex = "1000";
        marker._icon.style.pointerEvents = "auto";
        marker._icon.style.cursor = "pointer";
      }
    }, 50);
  });

  // 如果是当前高亮的点，显示 popup
  if (isCurrent && currentEvent) {
    const popupContent = `
      <div style="font-family: sans-serif;">
        <div style="font-size: 14px; margin-bottom: 4px;"><span style="margin-right: 10px;">${currentEvent.date}</span><span style="color: #666;">${location}</span></div>
        <div style="font-size: 13px;">${currentEvent.event}</div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      className: "current-event-popup",
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
      offset: [0, -10],
    });

    // 在标记添加到地图后打开 popup
    marker.on("add", function () {
      setTimeout(() => {
        marker.openPopup();
      }, 100);
    });
  }

  return marker;
}

/**
 * 更新事件标记
 */
export function updateEventMarkers(targetIndex) {
  state.eventMarkers.forEach((marker) => state.map.removeLayer(marker));
  state.eventMarkers = [];
  state.locationMarkers.clear();

  state.locationGroups = groupEventsByLocation(
    state.trajectoryData.events,
    targetIndex
  );

  const currentEvent = state.trajectoryData.events[targetIndex];
  const currentCoordKey = currentEvent.endCoords
    ? `${currentEvent.endCoords[0]},${currentEvent.endCoords[1]}`
    : null;

  let currentLatLng = null;

  state.locationGroups.forEach((locationGroup, coordKey) => {
    const isCurrent = coordKey === currentCoordKey;
    const isVisited = !isCurrent;

    const marker = createLocationMarker(
      locationGroup,
      isCurrent,
      isVisited,
      isCurrent ? currentEvent : null
    );

    if (marker) {
      marker.addTo(state.map);
      state.eventMarkers.push(marker);
      state.locationMarkers.set(coordKey, marker);

      if (isCurrent) {
        const [clng, clat] = locationGroup.coordinates;
        currentLatLng = [clat, clng];
      }
    }
  });

  // 更新当前事件的呼吸灯高亮标记
  updateHighlightMarker(currentLatLng);

  setTimeout(() => {
    ensureMarkersInteractivity();
  }, 100);
}

// ==================== 呼吸灯高亮标记 ====================

let highlightMarker = null;

function updateHighlightMarker(latLng) {
  if (!state.map) {
    return;
  }

  // 没有当前位置时隐藏高亮
  if (!latLng) {
    if (highlightMarker) {
      state.map.removeLayer(highlightMarker);
      highlightMarker = null;
    }
    return;
  }

  if (!highlightMarker) {
    // 创建波纹容器HTML，包含3个波纹圆环
    const rippleHTML = `
      <div class="ripple-container">
        <div class="ripple-wave ripple-wave-1"></div>
        <div class="ripple-wave ripple-wave-2"></div>
        <div class="ripple-wave ripple-wave-3"></div>
      </div>
    `;

    const icon = L.divIcon({
      className: "breath-highlight-wrapper",
      html: rippleHTML,
      iconSize: [0, 0], // 设置为0，让波纹从标记点中心扩散
      iconAnchor: [0, 0], // 锚点设置为0，波纹从标记点位置开始
    });

    highlightMarker = L.marker(latLng, {
      icon,
      interactive: false,
      keyboard: false,
      // 降低 zIndexOffset，确保呼吸灯在标记点下方，不遮挡其他覆盖物
      zIndexOffset: -1000,
    });

    highlightMarker.addTo(state.map);
  } else {
    highlightMarker.setLatLng(latLng);
    // 如果由于地图图层清理被移除了，需要重新添加到地图上
    if (!state.map.hasLayer(highlightMarker)) {
      highlightMarker.addTo(state.map);
    }
  }
}

