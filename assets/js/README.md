# JavaScript 模块说明

原 `app.js` 已被拆分为多个模块化文件，更易于维护和扩展。

## 文件结构

```
assets/js/
├── main.js              # 主入口文件
├── config.js            # 全局配置和常量
├── state.js             # 全局状态管理
├── utils.js             # 工具函数
├── map.js               # 地图初始化和基础功能
├── data-loader.js       # 数据加载和处理
├── coordinates.js       # 坐标处理和匹配
├── markers.js           # 标记创建和管理
├── paths.js             # 路径创建和动画
├── camera.js            # 镜头控制
├── panels.js            # 面板控制（详情面板、统计面板）
├── path-highlight.js    # 路径高亮功能
├── ui-updates.js        # UI 更新（事件信息、进度等）
├── controls.js          # 播放控制和键盘控制
├── animations.js        # 动画设置控制
├── poetry.js            # 诗句动画
├── mobile.js            # 移动端交互
├── performance.js       # 性能优化
└── events.js            # 事件绑定
```

## 模块职责

### 核心模块

- **main.js** - 应用程序入口，负责初始化流程
- **config.js** - 定义全局常量（坐标、速度档位、诗句库等）
- **state.js** - 管理全局状态变量（地图实例、数据、UI 状态等）
- **utils.js** - 提供通用工具函数

### 数据处理

- **data-loader.js** - 加载地理数据和轨迹事件数据
- **coordinates.js** - 处理坐标匹配和地点名称格式化

### 地图相关

- **map.js** - 初始化 Leaflet 地图，计算边界框
- **markers.js** - 创建和更新地点标记
- **paths.js** - 创建 Motion 路径动画，控制路径显示
- **camera.js** - 镜头跟随和视角控制

### UI 交互

- **panels.js** - 控制详情面板、统计面板的显示和交互
- **path-highlight.js** - 路径高亮效果
- **ui-updates.js** - 更新事件信息、进度条、统计数据
- **controls.js** - 播放/暂停控制、键盘快捷键
- **animations.js** - 动画设置（速度、时长）
- **poetry.js** - 诗句动画效果
- **mobile.js** - 移动端特定交互
- **events.js** - 统一管理所有事件监听器

### 性能优化

- **performance.js** - Motion 插件检查、资源清理、性能监控

## 模块依赖关系

```
main.js
  ├── state.js
  ├── config.js
  ├── map.js
  ├── data-loader.js
  │   ├── coordinates.js
  │   └── state.js
  ├── paths.js
  │   ├── markers.js
  │   ├── ui-updates.js
  │   ├── camera.js
  │   └── state.js
  ├── events.js
  │   ├── controls.js
  │   ├── animations.js
  │   ├── panels.js
  │   ├── mobile.js
  │   └── camera.js
  └── performance.js
```

## ES6 模块特性

所有文件使用 ES6 模块系统：

- 使用 `export` 导出函数和变量
- 使用 `import` 导入依赖
- HTML 中使用 `<script type="module">` 引入

## 优势

1. **模块化** - 每个文件职责单一，代码更清晰
2. **可维护性** - 更容易定位和修改功能
3. **可扩展性** - 添加新功能无需修改大文件
4. **复用性** - 工具函数可独立使用
5. **调试友好** - 错误堆栈更清晰

## 开发建议

- 修改某个功能时，只需要关注对应的模块文件
- 新增功能时，考虑创建新模块或扩展现有模块
- 状态管理统一通过 `state.js`，避免全局变量污染
- 配置项统一在 `config.js` 中定义

## 浏览器支持

需要浏览器支持 ES6 模块：
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+

如需支持旧浏览器，可使用 Webpack 或 Rollup 打包。

## 代码规范

项目已配置 ESLint 进行代码检查：

### 安装依赖

```bash
cd map
npm install
```

### 运行 ESLint

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

### ESLint 配置

- 位置：`/map/.eslintrc.json`
- 规则：基于 `eslint:recommended`
- 全局变量：`L`（Leaflet）
- 模块类型：ES6 modules

## 常见问题修复

### require is not defined

❌ 错误写法（CommonJS）：
```javascript
const { myFunc } = require('./module.js');
```

✅ 正确写法（ES6）：
```javascript
import { myFunc } from './module.js';
```

注意：`import` 必须在文件顶部，不能在函数内部使用。

### 模块导入路径

确保导入路径包含 `.js` 扩展名：
```javascript
import { state } from './state.js';  // ✅ 正确
import { state } from './state';     // ❌ 错误
```

