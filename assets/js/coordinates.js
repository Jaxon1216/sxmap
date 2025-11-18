/*!
 * 坐标处理和匹配模块
 */

import { state } from "./state.js";

/**
 * 构建完整的行政区划路径
 */
export function buildFullLocationPath(locationInfo) {
  if (!locationInfo) {
    return null;
  }

  const parts = [];

  if (locationInfo.country && locationInfo.country !== "中国") {
    parts.push(locationInfo.country);
    if (locationInfo.city) {
      parts.push(locationInfo.city);
    }
  } else {
    if (locationInfo.province) {
      parts.push(locationInfo.province);
    }
    if (locationInfo.city) {
      parts.push(locationInfo.city);
    }
    if (locationInfo.district && locationInfo.district !== locationInfo.city) {
      parts.push(locationInfo.district);
    }
  }

  const fullPath = parts.length > 0 ? parts.join(" ") : null;
  return fullPath;
}

/**
 * 根据位置信息获取坐标
 */
export function getCoordinates(locationInfo) {
  if (!locationInfo) {
    return null;
  }

  if (locationInfo.coordinates) {
    return locationInfo.coordinates;
  }

  const fullPath = buildFullLocationPath(locationInfo);
  if (fullPath && state.coordinateMap.has(fullPath)) {
    return state.coordinateMap.get(fullPath);
  }

  console.warn("无法匹配坐标:", locationInfo, "构建路径:", fullPath);
  return null;
}

/**
 * 格式化地点名称显示
 */
export function formatLocationName(locationInfo) {
  if (!locationInfo) {
    return "未知地点";
  }

  const parts = [];

  if (locationInfo.country && locationInfo.country !== "中国") {
    parts.push(locationInfo.country);
    if (locationInfo.city) {
      parts.push(locationInfo.city);
    }
  } else {
    if (locationInfo.province) {
      parts.push(locationInfo.province);
    }
    if (locationInfo.city && locationInfo.city !== locationInfo.province) {
      parts.push(locationInfo.city);
    }
    if (locationInfo.district && locationInfo.district !== locationInfo.city) {
      parts.push(locationInfo.district);
    }
  }

  return parts.length > 0 ? parts.join(" ") : "未知地点";
}

/**
 * 获取坐标和格式化地点名称
 */
export function getCoordinatesWithLocation(locationInfo) {
  if (!locationInfo) {
    return { coordinates: null, location: "未知地点" };
  }

  if (locationInfo.coordinates) {
    return {
      coordinates: locationInfo.coordinates,
      location: formatLocationName(locationInfo),
    };
  }

  const fullPath = buildFullLocationPath(locationInfo);
  const coordinates =
    fullPath && state.coordinateMap.has(fullPath)
      ? state.coordinateMap.get(fullPath)
      : null;

  return {
    coordinates: coordinates,
    location: formatLocationName(locationInfo),
  };
}

