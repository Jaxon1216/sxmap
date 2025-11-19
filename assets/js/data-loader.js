/*!
 * 数据加载模块
 */

import { state } from "./state.js";
import { INTERNATIONAL_COORDINATES } from "./config.js";
import { getCoordinates, getCoordinatesWithLocation } from "./coordinates.js";

/**
 * 从地区数据构建坐标映射表
 */
export function buildCoordinateMapFromRegions() {
  console.log("建立坐标映射...");

  if (state.regionsData && state.regionsData.regions) {
    state.regionsData.regions.forEach((region) => {
      const extPath = region.ext_path;
      const coordinates = region.coordinates;

      if (
        extPath &&
        coordinates &&
        Array.isArray(coordinates) &&
        coordinates.length === 2
      ) {
        state.coordinateMap.set(extPath, coordinates);
      }
    });
  }

  Object.entries(INTERNATIONAL_COORDINATES).forEach(([name, coords]) => {
    state.coordinateMap.set(name, coords);
  });

  console.log("坐标映射建立完成，共", state.coordinateMap.size, "个地点");
  console.log("国际坐标:", Object.keys(INTERNATIONAL_COORDINATES));
}

/**
 * 加载地理坐标数据
 */
export async function loadGeographicData() {
  try {
    const response = await fetch("data/china_regions_coordinates.json");

    if (response.ok) {
      state.regionsData = await response.json();
      buildCoordinateMapFromRegions();
      console.log("china_regions_coordinates.json 加载成功");
    } else {
      throw new Error("china_regions_coordinates.json 加载失败");
    }

    return true;
  } catch (error) {
    console.warn("外部地理数据加载失败:", error.message);
    Object.entries(INTERNATIONAL_COORDINATES).forEach(([name, coords]) => {
      state.coordinateMap.set(name, coords);
    });
    console.log("已加载备用国际坐标数据");
    return true;
  }
}

/**
 * 处理原始轨迹数据，添加坐标信息
 */
export function processTrajectoryData(data) {
  const processedEvents = data.events.map((event, index) => {
    const processed = {
      ...event,
      index: index,
      startCoords: null,
      endCoords: null,
      transitCoords: [],
      startLocation: null,
      endLocation: null,
    };

    if (event.coordinates && event.coordinates.start) {
      const startResult = getCoordinatesWithLocation(event.coordinates.start);
      processed.startCoords = startResult.coordinates;
      processed.startLocation = startResult.location;
    }

    if (event.coordinates && event.coordinates.end) {
      const endResult = getCoordinatesWithLocation(event.coordinates.end);
      processed.endCoords = endResult.coordinates;
      processed.endLocation = endResult.location;
    }

    if (event.coordinates && event.coordinates.transit) {
      processed.transitCoords = event.coordinates.transit
        .map((transit) => getCoordinates(transit))
        .filter((coords) => coords !== null);
    }

    if (!processed.endLocation && processed.startLocation) {
      processed.endLocation = processed.startLocation;
      processed.endCoords = processed.startCoords;
    }

    return processed;
  });

  return {
    ...data,
    events: processedEvents,
  };
}

/**
 * 加载轨迹事件数据
 * @param {string} dataFile - 数据文件路径，默认为毛泽东数据
 */
export async function loadTrajectoryData(dataFile = "data/mao_trajectory_events.json") {
  try {
    console.log("开始加载数据:", dataFile);
    const response = await fetch(dataFile);
    if (!response.ok) {
      throw new Error(
        `加载事件数据失败: ${response.status} - ${response.statusText}`
      );
    }

    const rawData = await response.json();

    if (
      !rawData.events ||
      !Array.isArray(rawData.events) ||
      rawData.events.length === 0
    ) {
      throw new Error(`${dataFile} 格式错误或事件数据为空`);
    }

    console.log("数据加载成功:", dataFile, "事件数:", rawData.events.length);
    return processTrajectoryData(rawData);
  } catch (error) {
    console.error("加载轨迹数据失败:", error);
    throw error;
  }
}

