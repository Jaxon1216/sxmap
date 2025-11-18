/*!
 * 标记创建和管理模块
 */

import { state } from "./state.js";
import { isMobileDevice } from "./utils.js";
import { getCoordinatesWithLocation } from "./coordinates.js";
import { showDetailPanel } from "./panels.js";
import { ensureMarkersInteractivity } from "./map.js";

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
  isVisited = false
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

  const baseSize = isMobileDevice() ? 2 : 0;
  const iconSizes = {
    1: [14 + baseSize, 14 + baseSize],
    2: [18 + baseSize, 18 + baseSize],
    3: [22 + baseSize, 22 + baseSize],
    4: [26 + baseSize, 26 + baseSize],
  };

  const sizeKey = visitCount >= 4 ? 4 : visitCount;
  const iconSize = iconSizes[sizeKey];
  const iconAnchor = [iconSize[0] / 2, iconSize[1] / 2];

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

  let tooltipText;
  if (visitCount === 1) {
    const event = events[0];
    tooltipText = `${event.date} - ${event.visitType === "途径" ? "途经" : ""}${
      event.originalEvent || event.event
    }`;
  } else {
    const transitCount = events.filter((e) => e.visitType === "途径").length;
    const destCount = events.filter((e) => e.visitType === "目的地").length;
    const startCount = events.filter((e) => e.visitType === "起点").length;
    const activityCount = events.filter((e) => e.visitType === "活动").length;
    const birthCount = events.filter((e) => e.visitType === "出生").length;

    const descParts = [];
    if (birthCount > 0) {
      descParts.push(`${birthCount}次出生`);
    }
    if (destCount > 0) {
      descParts.push(`${destCount}次到达`);
    }
    if (startCount > 0) {
      descParts.push(`${startCount}次出发`);
    }
    if (transitCount > 0) {
      descParts.push(`${transitCount}次途径`);
    }
    if (activityCount > 0) {
      descParts.push(`${activityCount}次活动`);
    }

    tooltipText = `${location} (${descParts.join("，")})`;
  }

  marker.bindTooltip(tooltipText, {
    direction: "top",
    offset: [0, -15],
    className: "simple-tooltip",
  });

  return marker;
}

/**
 * 更新事件标记
 */
export function updateEventMarkers(targetIndex) {
  state.eventMarkers.forEach((marker) => state.map.removeLayer(marker));
  state.eventMarkers = [];
  state.locationMarkers.clear();

  state.locationGroups = groupEventsByLocation(state.trajectoryData.events, targetIndex);

  const currentEvent = state.trajectoryData.events[targetIndex];
  const currentCoordKey = currentEvent.endCoords
    ? `${currentEvent.endCoords[0]},${currentEvent.endCoords[1]}`
    : null;

  state.locationGroups.forEach((locationGroup, coordKey) => {
    const isCurrent = coordKey === currentCoordKey;
    const isVisited = !isCurrent;

    const marker = createLocationMarker(locationGroup, isCurrent, isVisited);

    if (marker) {
      marker.addTo(state.map);
      state.eventMarkers.push(marker);
      state.locationMarkers.set(coordKey, marker);
    }
  });

  setTimeout(() => {
    ensureMarkersInteractivity();
  }, 100);
}

