/*!
 * 导航栏模块
 */

import { NAVIGATION_CONFIG } from "./config.js";
import { state } from "./state.js";

/**
 * 获取当前激活的导航配置
 */
export function getActiveNavConfig() {
  return NAVIGATION_CONFIG.find(nav => nav.active) || NAVIGATION_CONFIG[0];
}

/**
 * 初始化导航栏
 */
export function initNavigation() {
  const navItemsContainer = document.getElementById("nav-items");
  if (!navItemsContainer) {
    console.warn("导航容器未找到");
    return;
  }

  // 清空现有内容
  navItemsContainer.innerHTML = "";

  // 生成导航项
  NAVIGATION_CONFIG.forEach(navConfig => {
    const navItem = document.createElement("div");
    navItem.className = `nav-item ${navConfig.active ? "active" : ""}`;
    navItem.textContent = navConfig.name;
    navItem.dataset.navId = navConfig.id;
    navItem.title = navConfig.description;

    // 点击事件
    navItem.addEventListener("click", () => {
      handleNavClick(navConfig.id);
    });

    navItemsContainer.appendChild(navItem);
  });

  console.log("导航栏初始化完成");
}

/**
 * 处理导航点击事件
 */
async function handleNavClick(navId) {
  // 查找对应的导航配置
  const navConfig = NAVIGATION_CONFIG.find(nav => nav.id === navId);
  if (!navConfig) {
    console.error("未找到导航配置:", navId);
    return;
  }

  // 如果已经是当前激活的导航，不做处理
  const currentActiveNav = getActiveNavConfig();
  if (currentActiveNav.id === navId) {
    console.log("已经是当前导航:", navId);
    return;
  }

  console.log("切换导航:", navId, navConfig.name);

  // 更新激活状态
  NAVIGATION_CONFIG.forEach(nav => {
    nav.active = (nav.id === navId);
  });

  // 更新 UI 激活状态
  updateNavUIState(navId);

  // 触发数据重新加载
  await reloadDataForNav(navConfig);
}

/**
 * 更新导航栏 UI 激活状态
 */
function updateNavUIState(activeNavId) {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    if (item.dataset.navId === activeNavId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * 为指定导航重新加载数据
 */
async function reloadDataForNav(navConfig) {
  try {
    // 显示加载提示
    showLoading("正在切换数据...");

    // 更新页面标题
    document.title = `${navConfig.name} - 生平地理轨迹`;

    // 更新时间范围显示
    updateTimeRangeDisplay(navConfig.startDate, navConfig.endDate);

    // 触发自定义事件，通知其他模块数据需要重新加载
    const event = new CustomEvent("navigationChanged", {
      detail: {
        navConfig: navConfig
      }
    });
    window.dispatchEvent(event);

    console.log("导航切换完成:", navConfig.name);
  } catch (error) {
    console.error("切换导航时出错:", error);
    alert(`切换失败: ${error.message}`);
    hideLoading();
  }
}

/**
 * 更新时间范围显示
 */
function updateTimeRangeDisplay(startDate, endDate) {
  // 更新右侧控制面板的时间范围
  const timeRangeTexts = document.querySelectorAll(".time-range-text");
  if (timeRangeTexts.length >= 2) {
    timeRangeTexts[0].textContent = startDate;
    timeRangeTexts[1].textContent = endDate;
  }

  // 更新底部时间轴的时间范围（PC端）
  const timePoints = document.querySelectorAll(".time-point .value");
  if (timePoints.length >= 2) {
    timePoints[0].textContent = startDate;
    timePoints[1].textContent = endDate;
  }
}

/**
 * 显示加载提示
 */
function showLoading(message = "正在加载数据...") {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    const loadingText = loadingEl.querySelector(".loading-text");
    if (loadingText) {
      loadingText.textContent = message;
    }
    loadingEl.style.display = "block";
  }
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.style.display = "none";
  }
}

