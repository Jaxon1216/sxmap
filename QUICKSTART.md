# 快速启动指南 🚀

## ⚠️ 重要提示

代码已修复 `require is not defined` 错误！所有模块已改用 ES6 `import` 语法。

## 🔧 修复内容

### 1. 移除了 CommonJS 的 `require`
- ❌ 旧代码：`const { func } = require('./module.js');`
- ✅ 新代码：`import { func } from './module.js';`

### 2. 添加了 ESLint 配置
- 自动检查代码规范
- 提前发现潜在问题
- 统一代码风格

## 📦 安装步骤

### 1. 安装 Node.js 依赖（用于 ESLint）

```bash
cd map
npm install
```

如果没有 npm，可以跳过此步骤，项目依然可以运行。

### 2. 启动本地服务器

**方法一：使用 VS Code Live Server 插件**
1. 安装 Live Server 插件
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

**方法二：使用 Python**
```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

**方法三：使用 Node.js**
```bash
npx http-server -p 5500
```

### 3. 访问应用

打开浏览器，访问：
```
http://127.0.0.1:5500/map/index.html
```

## ✅ 验证安装

打开浏览器控制台（F12），应该看到：
- ✅ "地图初始化完成"
- ✅ "✅ leaflet.motion 插件加载成功"
- ✅ "坐标映射建立完成"
- ❌ 不应该有 "require is not defined" 错误

## 🔍 代码检查（可选）

如果已安装 npm 依赖，可以运行：

```bash
# 检查代码
npm run lint

# 自动修复格式问题
npm run lint:fix
```

## 🐛 常见问题

### Q1: 页面空白，控制台显示 CORS 错误

**原因**: 直接双击打开 HTML 文件（file:// 协议）
**解决**: 必须通过 HTTP 服务器访问

### Q2: 模块加载失败 404

**原因**: 文件路径错误或服务器配置问题
**解决**: 
- 确保从 `map/` 目录启动服务器
- 访问 `http://127.0.0.1:5500/map/index.html` 而不是 `http://127.0.0.1:5500/index.html`

### Q3: "require is not defined" 错误

**原因**: 代码中仍使用 CommonJS 语法
**解决**: 已修复！如果仍有此错误，请检查是否有未更新的文件

### Q4: Leaflet 或 L is not defined

**原因**: Leaflet 库未加载或加载顺序错误
**解决**: 确保 `index.html` 中 Leaflet 脚本在 `main.js` 之前

## 📁 项目结构

```
map/
├── index.html              # 主页面
├── assets/
│   ├── js/
│   │   ├── main.js        # 入口文件 ⭐
│   │   ├── config.js      # 配置
│   │   ├── state.js       # 状态
│   │   └── ...            # 其他模块
│   └── css/
│       └── style.css
├── data/                   # 数据文件
├── package.json            # NPM 配置
├── .eslintrc.json         # ESLint 配置
└── DEVELOPMENT.md         # 开发文档
```

## 🎯 下一步

1. ✅ 确认页面正常运行
2. 📖 阅读 `/map/assets/js/README.md` 了解模块结构
3. 🛠️ 阅读 `/map/DEVELOPMENT.md` 学习开发流程
4. 🔍 运行 `npm run lint` 检查代码质量

## 💡 开发提示

- **修改代码**: 直接编辑对应的模块文件
- **添加功能**: 在合适的模块中添加函数并导出
- **调试**: 使用浏览器开发者工具（F12）
- **代码规范**: 运行 `npm run lint:fix` 自动格式化

## 📚 相关文档

- [模块说明](assets/js/README.md) - 详细的模块架构说明
- [开发指南](DEVELOPMENT.md) - 完整的开发流程和规范
- [贡献指南](CONTRIBUTING.md) - 如何贡献代码（如果有的话）

## 🎉 成功运行

如果看到地图正常显示，恭喜你已经成功运行项目！

祝编码愉快！✨

