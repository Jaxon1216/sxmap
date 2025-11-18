/*!
 * 全局状态管理
 */

import { DEFAULT_ANIMATION_CONFIG } from './config.js';

// ==================== 全局状态变量 ====================
export const state = {
  // 地图和数据
  map: null,
  regionsData: null,
  trajectoryData: null,
  
  // 事件索引
  currentEventIndex: 0,
  previousEventIndex: 0,
  
  // 播放控制
  isPlaying: false,
  playInterval: null,
  currentPlaySpeed: 1000,
  
  // 标记和路径
  eventMarkers: [],
  pathLayers: [],
  coordinateMap: new Map(),
  locationGroups: new Map(),
  locationMarkers: new Map(),
  motionPaths: new Map(),
  
  // UI状态
  statsHoverTimeout: null,
  isPanelVisible: true,
  isFeedbackModalVisible: false,
  isCameraFollowEnabled: true,
  isDragging: false,
  
  // 动画状态
  isPoetryAnimationPlaying: false,
  poetryAnimationTimeout: null,
  highlightedPaths: [],
  highlightTimeout: null,
  currentHighlightedEventIndex: -1,
  animationQueue: [],
  isAnimationInProgress: false,
  
  // 音频状态
  audioLoadingPromise: null,
  isAutoPlayPending: false,
  currentAudioEventListeners: new Set(),
  
  // 动画配置
  animationConfig: { ...DEFAULT_ANIMATION_CONFIG },
};

/**
 * 重置状态
 */
export function resetState() {
  state.currentEventIndex = 0;
  state.previousEventIndex = 0;
  state.isPlaying = false;
  if (state.playInterval) {
    clearTimeout(state.playInterval);
    state.playInterval = null;
  }
  state.eventMarkers = [];
  state.pathLayers = [];
  state.highlightedPaths = [];
  state.currentHighlightedEventIndex = -1;
}

