# DropShare 移动端适配优化文档

本指南基于当前代码库的移动实现（HTML/CSS/JS）全面梳理与优化建议，帮助在多终端（手机/平板）上获得更稳定一致的体验。

---

## 1. 目标与范围
- 覆盖页面：`public/` 下所有工具页与共享、政策、测试页面。
- 适配目标：iOS Safari、Android Chrome、微信内置浏览器、桌面 Chrome/Firefox/Edge 的窄窗口；兼顾平板横竖屏。
- 关注维度：视口与断点、布局与排版、安全区域、手势与交互、性能、无障碍与系统偏好、兼容性风险。

---

## 2. 当前实现综述（代码扫描要点）
- 视口：大多数页面包含 `<meta name="viewport" content="width=device-width, initial-scale=1.0">`；少数页面使用 `user-scalable=no`（如 `public/privacy.html`、`public/share.html`、`public/terms-light.html`）。建议去除 `user-scalable=no` 以提升无障碍。
- 断点：CSS 广泛使用 `@media (max-width: 768px)` 与 `@media (max-width: 480px)`，并针对横屏、最小高度、`(hover: none) and (pointer: coarse)`、`prefers-color-scheme`、`prefers-contrast`、`prefers-reduced-motion` 等建立差异化样式。
- 安全区域：`env(safe-area-inset-*)` 在 `public/styles/mobile-enhancements.css`、`public/styles/browser-compatibility.css` 已有使用。
- 触控 JS：`public/scripts/mobile-navigation.js`、`mobile-enhancements.js`、`ui.js`、`file-preview.js` 等包含 `touchstart/touchmove`、`resize`、`orientationchange`、`matchMedia` 监听，具备移动特性检测与部分手势优化。
- 主题与偏好：广泛使用 `matchMedia('(prefers-color-scheme: dark)')`，并对高对比度、减少动画有处理。

---

## 3. 统一规范与总原则
- 统一视口：所有页面使用 `width=device-width, initial-scale=1.0`；移除 `user-scalable=no`，允许用户缩放，提升可访问性。
- 断点策略：保留现有 768px（手机/平板阈值）与 480px（小屏手机）；新增推荐断点 1024px（平板横屏/大屏手机横屏优化）。
- 单位与排版：
  - 文本与间距优先使用 `rem`；组件宽度使用百分比/弹性；必要时使用 `clamp()` 实现流式排版。
  - 避免全站固定 `vh`，在需要贴合可视高时使用 `dvh`/`svh`/`lvh`（支持度检测后回退）。
- 安全区域：统一使用工具类或容器类（如 `.mobile-enhanced`）包裹需贴边的固定元素，处理刘海屏与底部 Home 区域。
- 事件监听：默认使用被动监听 `{ passive: true }`，对需阻止默认行为的手势（如自定义滑动）再显式设置 `passive: false`。
- 动画与性能：尊重用户“减少动画”偏好；尽量用 `transform/opacity`，避免触发布局；在移动端降低粒子/阴影/模糊等昂贵效果。

---

## 4. 视口与安全区域
- 视口统一：
  - 必须：`<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  - 不建议：`user-scalable=no`（影响缩放可用性与无障碍）。
- 安全区域适配：
  - 为 `header`/`footer`/`fixed-bottom`/`toast` 等固定元素添加安全区补偿。
  - 使用：`padding-left/right/top/bottom: max(16px, env(safe-area-inset-*))`。
  - iOS 键盘弹出时，避免使用 100vh 造成“被键盘覆盖”的问题，改用 `dvh` 并在 JS 中在 `resize` 事件下做最小化 UI 调整。

---

## 5. 断点与布局策略
- 推荐断点：
  - ≤480px：小屏手机
  - ≤768px：通用手机/小平板
  - ≤1024px：平板/大屏手机横屏
- 交互类媒体特性：
  - `(hover: none) and (pointer: coarse)`：触屏优化（扩大点击区、隐藏悬停提示、改长按/滑动手势）。
  - `(orientation: landscape)`：横屏时压缩垂直空间的组件（工具栏、底部栏）高度。
- 栅格与容器：
  - 最大宽度容器建议 `max-width: 1200px` 桌面，移动端边距 16px 起步，使用 `clamp(16px, 4vw, 24px)` 自适应。
  - 工具页常见布局（上传区/预览区/操作区）：在 ≤768px 下改为纵向堆叠，优先展示主任务区。

---

## 6. 排版与尺寸
- 字体：
  - 基准字号：16px（html），移动端正文 `clamp(14px, 1.6vw, 16px)`；标题使用阶梯式 `clamp()`。
- 触控尺寸：
  - 点击控件最小可视尺寸 ≥ 44x44px，行高 ≥ 44px。
- 间距系统：
  - 定义 4/8/12/16/24/32 标准间距刻度，移动端优先使用 8/12/16。

---

## 7. 触控与手势
- 监听策略：
  - 全局滚动相关：`passive: true`；自定义手势（滑动关闭面板/图片缩放）：`passive: false` 并仅在需要处使用。
- 手势冲突：
  - 对可横向滚动区域添加 `touch-action: pan-y`，对纵向滚动添加 `touch-action: pan-x`，减少与浏览器默认手势冲突。
- 300ms 延迟：
  - 现代浏览器已基本移除，但在旧环境或特定 UA 中可通过 `meta viewport` 与避免双击缩放的排版来减少。

---

## 8. 组件与页面级建议
- 导航与底部栏：
  - 移动端建议采用底部操作条/浮动主按钮（FAB），注意安全区与遮挡。
  - 抽屉/侧滑菜单在 ≤768px 默认收起；打开时禁止主滚动，避免背景滚动穿透。
- 列表/网格：
  - 小屏使用单列或 2 列，卡片内信息分层；图片统一比率裁切，避免跳动。
- 表单与上传：
  - 输入类型使用合适的 `type`/`inputmode`；文件选择按钮做大；进度与错误提示清晰。
- 弹窗与浮层：
  - 使用全屏/底部弹出样式（Bottom Sheet），支持手势关闭与返回键关闭；遮罩可点击关闭但避免误触。
- 工具页（转换/压缩/预览）：
  - 预览区在纵向优先，操作区折叠到面板内；横屏时并排布局。
- Image 工具网格（移动端）：
  - 布局：两列网格（每行 2 项），最多 4 行（≤8 项）；超过部分采用“展开更多”或分页。
  - 断点：≤768px 启用两列；≥769px 恢复为 3–4 列（依据可用宽度）。
  - 卡片：固定缩略图比率（如 1:1 或 4:3），标题最多两行省略；点击目标区 ≥44px。
  - 间距：列间距 12–16px，行间距 12–16px；容器左右边距使用 `clamp(16px, 4vw, 24px)`。
  - 可访问：卡片可聚焦、`aria-label` 明确，选中/焦点态具备高对比可视反馈。
- 首页 Footer 上方说明模块（移动端）：
  - 将首页 footer 上方的“三个说明/优势项”在 ≤768px 隐藏；保留桌面端展示。
  - 如需在移动端保留，可改为横滑（swiper）或 1 列堆叠但默认折叠，仅在用户展开时显示。

---

## 9. 媒体与图片
- 图片响应式：使用 `srcset/sizes` 与 `loading="lazy"`；优先使用 WebP/AVIF，保留回退。
- 视频画布：限制最大宽度 100%，在小屏下控制最大高度（如 `clamp(200px, 50dvh, 420px)`）。

---

## 10. 性能优化（移动端重点）
- 动画：减少阴影/模糊/滤镜；对 `prefers-reduced-motion` 降级到淡入淡出。
- JS：
  - 避免在 `resize/orientationchange` 上高频重排，使用 `requestAnimationFrame`/节流。
  - 手势计算使用浮点且复用对象，避免频繁创建；解绑不再需要的监听。
- 资源：按需加载工具页脚本与样式，合并小资源，使用 HTTP 缓存策略。

---

## 11. 兼容性与风控
- iOS Safari：
  - 100vh 不含地址栏高度，建议用 `dvh`，或在 JS 里计算 `window.innerHeight` 设置 CSS 变量。
  - 软键盘弹出导致的视口变化需监听并避免输入框被遮挡。
- 安卓 Chrome：
  - 键盘 overlay 与滚动联动差异；注意固定元素在键盘弹出时的位置更新。
- 内置浏览器：
  - 某些 UA 对 `position: sticky`、`backdrop-filter`、`env()` 支持不完全，提供回退样式。

---

## 12. 无障碍与系统偏好
- 允许页面缩放；表单与控件具备可聚焦状态；颜色对比度满足 WCAG AA。
- 尊重 `prefers-color-scheme`、`prefers-contrast`、`prefers-reduced-motion`。
- 为触控目标提供可见的聚焦高亮与大触发区域。

---

## 13. QA 检查清单（抽样每次发布前）
- 设备：iPhone（含刘海/小屏 SE）、Android 多型号；iPad 竖/横；桌面窄窗。
- 场景：
  - 上传->处理->下载全链路；横竖屏切换；弱网/断网；深色模式；高对比度；减少动画。
  - 软键盘遮挡；返回键/手势返回；长列表滚动与吸顶元素；弹窗与遮罩交互。

---

## 14. 渐进式落地计划（建议）
1) 统一基础：
- 移除所有 `user-scalable=no`；补齐缺失 `viewport`。
- 在 `:root` 定义尺寸/间距/排版变量与 `dvh` 回退方案。
2) 关键体验：
- 规范导航/底部栏/抽屉在 ≤768px 的行为；完善安全区工具类。
- 为预览/工具操作区建立移动优先的并排/堆叠规则。
3) 性能与可访问：
- 动画降级、监听节流、按需加载；无障碍检查与对比度修正。
4) 全量验收：
- 设备矩阵走查与自动化快照。

---

## 15. 需要统一/修复的点（立即可做）
- 去除 `user-scalable=no`（`public/privacy.html`、`public/share.html`、`public/terms-light.html`）。
- 在公共样式中提供 `.safe-top/.safe-bottom/.safe-x` 工具类，统一使用。
- 将涉及 100vh 的关键容器切换为 `min-height: 100dvh`，并加 JS 回退。
- 对 `resize/orientationchange` 监听加入节流；仅在必要处使用 `passive: false`。
- 图片与视频容器统一最大高度策略，避免首屏“跳动”。
- 首页 footer 上方“三个说明/优势项”在移动端隐藏（CSS 媒体查询或按需渲染）。

---

## 16. 示例片段（可按需引用）

HTML 视口（统一版）
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

CSS 安全区域工具类与视高变量
```css
:root {
  /* JS 可在启动时更新为真实 innerHeight 值做回退 */
  --app-vh: 100dvh;
  --page-padding-x: clamp(16px, 4vw, 24px);
}

.safe-top { padding-top: max(16px, env(safe-area-inset-top)); }
.safe-bottom { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
.safe-x { padding-left: max(16px, env(safe-area-inset-left)); padding-right: max(16px, env(safe-area-inset-right)); }

.app-full-height { min-height: var(--app-vh); }
```

JS 视高回退与节流
```js
function setAppVhVar() {
  const vh = window.innerHeight;
  document.documentElement.style.setProperty('--app-vh', vh + 'px');
}
const throttle = (fn, wait = 100) => {
  let last = 0; let timer;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn.apply(null, args); }
    else { clearTimeout(timer); timer = setTimeout(() => { last = Date.now(); fn.apply(null, args); }, wait - (now - last)); }
  };
};
window.addEventListener('resize', throttle(setAppVhVar, 120));
window.addEventListener('orientationchange', () => setTimeout(setAppVhVar, 200));
setAppVhVar();
```

排版与触控尺寸示例
```css
html { font-size: 16px; }
body { font-size: clamp(14px, 1.6vw, 16px); }
button, .tap-target { min-height: 44px; min-width: 44px; }
.container { padding-left: var(--page-padding-x); padding-right: var(--page-padding-x); }
```

---

若需要，我可以直接按上述“立即可做”项在对应文件中提交小范围统一化 edits。
