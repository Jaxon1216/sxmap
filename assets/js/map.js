/*!
 * 地图初始化和基础功能
 */

import { state } from "./state.js";
// import { isMobileDevice } from "./utils.js";

/**
 * 初始化Leaflet地图
 */
export function initMap() {
  state.map = L.map("map", {
    center: [35.8617, 104.1954],
    zoom: 5,
    minZoom: 4,
    maxZoom: 10,
    zoomControl: true,
    attributionControl: false,
    tap: true,
    tapTolerance: 15,
  });

  // 高德卫星影像图层
  L.tileLayer(
    "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    {
      subdomains: "1234",
      attribution: "© 高德地图",
      maxZoom: 18,
    }
  ).addTo(state.map);

  // 高德卫星影像标注图层（路网、地名等）
  L.tileLayer(
    "https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
    {
      subdomains: "1234",
      attribution: "© 高德地图",
      maxZoom: 18,
    }
  ).addTo(state.map);

  console.log("地图初始化完成");
}

/**
 * 计算路径边界框
 */
export function calculatePathBounds(currentEvent, previousIndex) {
  const coordinates = [];

  if (previousIndex >= 0 && state.trajectoryData.events[previousIndex]) {
    const prevEvent = state.trajectoryData.events[previousIndex];
    if (prevEvent.endCoords) {
      coordinates.push([prevEvent.endCoords[1], prevEvent.endCoords[0]]);
    }
  }

  if (currentEvent.startCoords) {
    coordinates.push([
      currentEvent.startCoords[1],
      currentEvent.startCoords[0],
    ]);
  }

  if (currentEvent.transitCoords && currentEvent.transitCoords.length > 0) {
    currentEvent.transitCoords.forEach((coords) => {
      if (coords && coords.length === 2) {
        coordinates.push([coords[1], coords[0]]);
      }
    });
  }

  if (currentEvent.endCoords) {
    coordinates.push([currentEvent.endCoords[1], currentEvent.endCoords[0]]);
  }

  if (coordinates.length === 1) {
    const [lat, lng] = coordinates[0];
    const offset = 0.1;
    coordinates.push([lat + offset, lng + offset]);
    coordinates.push([lat - offset, lng - offset]);
  }

  if (coordinates.length >= 2) {
    try {
      return L.latLngBounds(coordinates);
    } catch (error) {
      console.warn("计算边界框失败:", error);
      return null;
    }
  }

  return null;
}

/**
 * 确保标记交互性正常工作
 */
export function ensureMarkersInteractivity() {
  state.eventMarkers.forEach((marker) => {
    if (marker._icon) {
      const zIndex = Math.abs(parseInt(marker._icon.style.zIndex) || 0) || 1000;
      marker._icon.style.zIndex = zIndex;

      marker._icon.style.pointerEvents = "auto";
      marker._icon.style.cursor = "pointer";

      if (!marker._hasInteractivityEnsured) {
        marker._hasInteractivityEnsured = true;

        const originalOnClick = marker._originalClickHandler;
        if (originalOnClick) {
          marker.off("click");
          marker.on("click", originalOnClick);
        }
      }
    }
  });

  if (state.map && state.map.invalidateSize) {
    state.map.invalidateSize({
      animate: false,
      pan: false,
    });
  }
}

