/*!
 * 全局配置文件
 */

// ==================== 导航配置 ====================
export const NAVIGATION_CONFIG = [
  // 后续可以添加更多导航项
  {
    id: "su_shi",
    name: "苏轼南贬之路",
    dataFile: "data/su_shi_trajectory_events.json",
    description: "苏轼南贬之路",
    active: false,
  },
  {
    id: "xu_xia_ke",
    name: "徐霞客西南远征之路",
    dataFile: "data/xu_xia_ke_trajectory_events.json",
    description: "徐霞客西南远征之路",
    active: true,
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
  3500: "极快",
  5000: "正常",
  7000: "较慢",
  10000: "极慢",
};

// 诗句库（与苏轼、徐霞客主题相关）
export const POETRY_TEXTS = [
  "谁道人生无再少？门前流水尚能西。",
  "回首向来萧瑟处，也无风雨也无晴。",
  "山川奇丽，万里独行不觉远。",
  "踏遍青山人未老，风物长宜放眼量。",
];

