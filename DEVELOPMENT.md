# 开发指南

## 环境要求

- Node.js >= 14.0.0
- 现代浏览器（支持 ES6 模块）

## 快速开始

### 1. 安装依赖

```bash
cd map
npm install
```

### 2. 启动开发服务器

使用 Live Server 或其他静态服务器：

```bash
# 使用 Live Server (VS Code 插件)
# 或者使用 Python
python -m http.server 5500

# 或者使用 Node.js http-server
npx http-server -p 5500
```

### 3. 访问应用

打开浏览器访问：`http://127.0.0.1:5500/map/index.html`

## 代码规范

### ESLint 检查

```bash
# 检查代码
npm run lint

# 自动修复代码格式问题
npm run lint:fix
```

### ESLint 规则说明

- **缩进**: 2个空格
- **引号**: 双引号（允许转义）
- **分号**: 必须使用
- **变量声明**: 优先使用 `const`，禁止使用 `var`
- **等号**: 必须使用 `===` 和 `!==`
- **大括号**: 必须使用，且采用 1TBS 风格
- **console**: 允许使用（开发需要）
- **debugger**: 警告级别

### 代码风格

```javascript
// ✅ 推荐
const myFunction = () => {
  if (condition) {
    console.log("正确的风格");
  }
};

// ❌ 不推荐
var myFunction = function() {
  if (condition)
    console.log('不推荐的风格')
}
```

## 项目结构

```
map/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js              # 入口文件
│       ├── config.js            # 配置
│       ├── state.js             # 状态管理
│       ├── utils.js             # 工具函数
│       ├── map.js               # 地图
│       ├── data-loader.js       # 数据加载
│       ├── coordinates.js       # 坐标处理
│       ├── markers.js           # 标记
│       ├── paths.js             # 路径
│       ├── camera.js            # 镜头
│       ├── panels.js            # 面板
│       ├── path-highlight.js    # 路径高亮
│       ├── ui-updates.js        # UI更新
│       ├── controls.js          # 控制
│       ├── animations.js        # 动画
│       ├── poetry.js            # 诗句
│       ├── mobile.js            # 移动端
│       ├── performance.js       # 性能
│       ├── events.js            # 事件
│       └── README.md            # 模块说明
├── data/
│   ├── china_regions_coordinates.json
│   └── mao_trajectory_events.json
├── index.html
├── package.json
├── .eslintrc.json
├── .eslintignore
└── DEVELOPMENT.md
```

## 开发流程

### 添加新功能

1. 确定功能属于哪个模块（或创建新模块）
2. 在对应模块文件中添加函数
3. 导出函数：`export function myFunction() { ... }`
4. 在需要使用的地方导入：`import { myFunction } from './module.js';`
5. 运行 ESLint 检查：`npm run lint`

### 修改现有功能

1. 找到对应的模块文件
2. 修改相关函数
3. 检查是否影响其他模块
4. 运行 ESLint 检查

### 调试技巧

1. **浏览器控制台**
   - 打开开发者工具（F12）
   - 查看 Console 标签的错误信息
   - 使用 Network 标签检查资源加载

2. **断点调试**
   - 在浏览器开发者工具的 Sources 标签中设置断点
   - 刷新页面，代码会在断点处暂停

3. **模块导入问题**
   - 确保所有 `import` 语句在文件顶部
   - 确保文件扩展名 `.js` 存在
   - 检查导出的函数名是否正确

## 常见问题

### Q: 页面显示空白或报错

**A**: 检查以下几点：
1. 浏览器控制台是否有错误信息
2. 是否使用了支持 ES6 模块的浏览器
3. 是否通过 HTTP(S) 服务器访问（不能直接打开 file:// 协议）
4. 检查 Network 标签，确认所有 JS 文件都成功加载

### Q: ESLint 报错太多

**A**: 运行 `npm run lint:fix` 自动修复大部分格式问题

### Q: 模块导入报错

**A**: 确保：
1. `import` 路径包含 `.js` 扩展名
2. 使用相对路径（`./` 或 `../`）
3. 导出的函数名和导入的函数名一致

### Q: Leaflet 或 leaflet.motion 未定义

**A**: 确保 `index.html` 中正确引入了这些库，且在 `main.js` 之前加载

## 性能优化建议

1. **路径数量**: 超过 20 条路径时自动降低动画时长
2. **移动端**: 自动调整标记大小和动画参数
3. **内存管理**: 及时清理不需要的路径和标记
4. **预加载**: 启动时预加载前 10 个事件的路径

## 浏览器兼容性

### 支持的浏览器

- Chrome/Edge >= 61
- Firefox >= 60
- Safari >= 11
- Opera >= 48

### 不支持的浏览器

- IE 11 及以下（不支持 ES6 模块）

如需支持旧浏览器，考虑使用 Webpack 或 Vite 打包。

## Git 工作流

```bash
# 创建功能分支
git checkout -b feature/your-feature

# 提交前检查代码
npm run lint

# 提交更改
git add .
git commit -m "feat: 添加新功能"

# 推送到远程
git push origin feature/your-feature
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 遵循代码规范
4. 提交 Pull Request
5. 等待代码审查

## 许可证

MIT License

