/*!
 * 全局配置文件
 */

// ==================== 全局常量 ====================
export const INTERNATIONAL_COORDINATES = {
  "俄罗斯 莫斯科": [37.6176, 55.7558],
};

// 镜头速度档位配置
export const CAMERA_SPEED_LEVELS = [
  {
    name: "极快",
    cameraFollowDuration: 600,
    cameraPanDuration: 400,
  },
  {
    name: "正常",
    cameraFollowDuration: 2000,
    cameraPanDuration: 1500,
  },
  {
    name: "慢速",
    cameraFollowDuration: 3500,
    cameraPanDuration: 2800,
  },
  {
    name: "极慢",
    cameraFollowDuration: 5000,
    cameraPanDuration: 4000,
  },
];

// 动画配置
export const DEFAULT_ANIMATION_CONFIG = {
  pathDuration: 5000, // 控制路径绘制速度
  timelineDuration: 1500, // 时间轴动画时长
  cameraFollowDuration: 2000, // 镜头跟随动画时长
  cameraPanDuration: 1500, // 镜头平移动画时长
  isAnimating: false,
  motionOptions: {
    auto: false, // 手动控制动画
    easing: null, // 将在运行时设置
  },
};

// 速度标签配置
export const SPEED_LABELS = {
  500: "极快",
  1000: "快速",
  2000: "正常",
  3000: "慢速",
  5000: "极慢",
};

// 诗句库
export const POETRY_TEXTS = [
  "俱往矣，数风流人物，还看今朝",
  "一万年太久，只争朝夕",
  "雄关漫道真如铁，而今迈步从头越",
  "江山如此多娇，引无数英雄竞折腰",
];

