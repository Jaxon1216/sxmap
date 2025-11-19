/*!
 * 全局配置文件
 */

// ==================== 导航配置 ====================
export const NAVIGATION_CONFIG = [
  // {
  //   id: "mao",
  //   name: "毛泽东",
  //   dataFile: "data/mao_trajectory_events.json",
  //   startDate: "1893-12-26",
  //   endDate: "1976-09-09",
  //   description: "毛泽东生平地理轨迹",
  //   active: true, // 默认激活
  // },
  // 后续可以添加更多导航项
  {
    id: "su_shi",
    name: "苏轼被贬之路",
    dataFile: "data/su_shi_trajectory_events.json",
    description: "苏轼被贬之路",
    active: true,
  },
  {
    id: "xu_xia_ke",
    name: "徐霞客的苦难与辉煌之路",
    dataFile: "data/xu_xia_ke_trajectory_events.json",
    description: "徐霞客的苦难与辉煌之路",
    active: false,
  },
];

// ==================== 全局常量 ====================
export const INTERNATIONAL_COORDINATES = {
  "俄罗斯 莫斯科": [37.6176, 55.7558],
};

// 镜头速度档位配置
export const CAMERA_SPEED_LEVELS = [
  {
    name: "极快",
    cameraFollowDuration: 300,
    cameraPanDuration: 200,
  },
  {
    name: "正常",
    cameraFollowDuration: 600,
    cameraPanDuration: 400,
  },
  {
    name: "慢速",
    cameraFollowDuration: 2000,
    cameraPanDuration: 1500,
  }
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

