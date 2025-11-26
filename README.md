<div align="center">

苏轼与徐霞客行迹图  

**一张用地图讲述两位旅行者生命轨迹的交互式可视化**

[在线预览（PC 端）](https://map.jiangxu.net)

</div>

---

## 项目简介

**苏轼与徐霞客行迹图** 是一个基于 Leaflet 的前端可视化小项目，通过时间轴动画与交互式地图，呈现：

- **苏轼南贬之路**：从北宋官场沉浮到谪居南方的颠沛旅程  
- **徐霞客西南远征之路**：以足迹丈量山河的远行轨迹  

项目在交互和性能上参考并改造自开源项目 **mao-map**（毛主席足迹地图），但已移除与毛泽东相关的数据与 UI，仅保留并强化与苏轼、徐霞客有关的内容。  
原项目地址：[`sansan0/mao-map`](https://github.com/sansan0/mao-map)

## 使用说明与平台支持

- **仅支持 PC 端浏览器访问**：目前界面与交互只针对桌面端设计，**不支持手机和平板**，移动端访问体验可能存在严重问题。  
- 推荐使用最新版 **Chrome / Edge / Firefox** 打开在线预览：  
  - [https://map.jiangxu.net](https://map.jiangxu.net)

## 本地预览与开发

项目是一个纯静态前端应用，无需打包构建，只要有一个静态 HTTP 服务即可本地预览。  
推荐使用 Python 自带的简易 HTTP 服务器。

### 步骤一：克隆仓库

```bash
git clone https://github.com/Jaxon1216/sxmap.git
cd sxmap
```

### 步骤二：使用 Python 启动本地服务

- 如果你安装的是 **Python 3**：

```bash
python3 -m http.server 8000
```

- 如果命令是 `python` 指向 Python 3，也可以使用：

```bash
python -m http.server 8000
```

启动成功后，在浏览器中访问：

```text
http://localhost:8000
```

页面会自动加载 `index.html`，即可在本地完整预览地图与动画效果（同在线站点，但依然只建议在 PC 浏览器中访问）。

## 功能概览

- **时间轴播放**
  - **播放 / 暂停**：右侧控制面板中的「播放」按钮控制事件按时间顺序自动推进  
  - **时间滑块**：底部时间轴支持拖动，快速定位到任意事件索引  

- **交互式地图**
  - **动态路径**：随时间推进，高亮展示从起点到终点的行进路线  
  - **地点标记**：不同地点会聚合多次访问记录，并高亮当前事件所在位置  
  - **城市标签**：在地图上以中文标注城市名称，当前事件对应城市会做视觉强调  

- **右侧信息与原文**
  - **事件列表**：按时间顺序列出事件，点击任一条可直接跳转到对应时间点  
  - **相关原文**：根据当前事件展示对应文献片段（如诗文、游记等），辅助理解当时心境  
  - **统计信息**：展示事件数量、移动次数、访问地区数量等概览数据  

## 项目结构概览

```text
sxmap (๑•̀ㅂ•́)و✧
├─ index.html              ← 单页入口，页面结构 & 各种容器
├─ assets/
│  ├─ css/
│  │  └─ style.css         ← 全站样式 & 动画 & 布局
│  ├─ img/
│  │  ├─ breath_red.png    ← 呼吸灯特效用的小图
│  │  └─ marker.green.png  ← 地图标记图钉
│  └─ js/
│     ├─ main.js           ← 入口脚本，初始化整个应用
│     ├─ config.js         ← 配置导航、动画参数、诗句等
│     ├─ state.js          ← 全局状态：当前事件、地图实例等
│     ├─ map.js            ← 创建 Leaflet 地图 & 基础图层
│     ├─ data-loader.js    ← 加载/预处理 JSON 轨迹与坐标数据
│     ├─ paths.js          ← 生成/更新路径与动画
│     ├─ markers.js        ← 地图标记点与 Popup
│     ├─ navigation.js     ← 顶部导航 & 路线切换
│     ├─ right-panel.js    ← 右侧控制面板结构和初始化
│     ├─ ui-updates.js     ← 更新事件列表、统计数字、时间范围等 UI
│     ├─ camera.js         ← 镜头跟随、平移缩放控制
│     ├─ controls.js       ← 播放/暂停/拖动时间轴等控制逻辑
│     ├─ events.js         ← 统一绑定各种 DOM 事件和交互
│     ├─ performance.js    ← 动画性能优化与监控
│     ├─ poetry.js         ← 播放诗句相关的小动画/效果
│     ├─ coordinates.js    ← 地名到经纬度的转换工具
│     ├─ panels.js         ← 详情面板等弹出层的行为
│     ├─ path-highlight.js ← 路径高亮/反向消失等效果
│     ├─ mobile.js         ← 移动端适配逻辑
│     └─ utils.js          ← 通用小工具函数
├─ data/
│  ├─ china_regions_coordinates.json   ← 全国地名到坐标的字典
│  ├─ su_shi_trajectory_events.json    ← 苏轼事件与轨迹数据
│  └─ xu_xia_ke_trajectory_events.json ← 徐霞客事件与轨迹数据
├─ README.md              ← 项目说明
├─ package.json           ← 项目元信息 & eslint 配置入口
└─ package-lock.json      ← npm 依赖锁定文件
```

## 开发建议

- 如需调整**播放速度 / 动画节奏**，可以在：
  - `config.js` 中修改 `DEFAULT_ANIMATION_CONFIG` 与 `CAMERA_SPEED_LEVELS`  
  - 或通过 UI 替换速度选项的具体数值
- 如需新增人物或线路，可以在：
  - `data/` 中新增一份事件 JSON  
  - 在 `config.js` 的 `NAVIGATION_CONFIG` 中追加一个导航项

## 版权与致谢

- 本项目基于原始开源项目 **mao-map** 修改而来，原项目地址：[`sansan0/mao-map`](https://github.com/sansan0/mao-map)  
- 目前的数据与界面聚焦于苏轼与徐霞客的行迹，已移除原项目中与毛泽东相关的内容。  
- 现版本由 [`https://github.com/Jaxon1216`](https://github.com/Jaxon1216) 维护。

## 开源协议

项目采用仓库中现有的 [`LICENSE`](LICENSE) 文件所声明的开源协议（GPL-3.0 License）。  
欢迎在遵守协议的前提下进行学习、分享与二次创作。
