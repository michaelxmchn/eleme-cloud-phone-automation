# AutoJS 自动化方案

## 方案介绍

使用 AutoJS 在云手机上直接运行 JavaScript 脚本，通过 Android 无障碍服务（Accessibility Service）实现 UI 自动化。

## 对比 ADB 方案

| 特性 | ADB | AutoJS |
|------|-----|--------|
| 点击检测 | 可能被APP检测 | ✅ 绕过检测 |
| UI获取 | uiautomator被屏蔽 | ✅ 完整UI遍历 |
| 开发难度 | 低 | 中 |
| 需要root | 否 | 否 |
| 跨设备 | 需要ADB连接 | 直接运行 |

## 使用步骤

### 步骤1：下载安装 AutoJS

在云手机上下载并安装 AutoJS：

- **AutoJS Pro**（付费版，功能完整）
- **AutoJS 免费版**（基础功能可用）

下载地址：
- AutoJS Pro: https://www.autoxjs.com/
- 或者在应用宝搜索"AutoJS"

### 步骤2：导入脚本

1. 将 `eleme_autojs.js` 复制到云手机
2. 打开 AutoJS
3. 点击"导入"按钮
4. 选择 `eleme_autojs.js`

### 步骤3：开启无障碍服务

1. 在 AutoJS 中点击"开启无障碍服务"
2. 跳转到系统设置
3. 找到 AutoJS 并开启
4. 确认授权

**重要**：无障碍服务是必须的，否则脚本无法操作UI。

### 步骤4：运行脚本

1. 在 AutoJS 中打开 `eleme_autojs.js`
2. 点击运行按钮
3. 观察日志输出

## 脚本功能

### 已实现功能

| 功能 | 函数 | 说明 |
|------|------|------|
| 启动APP | launchApp() | 打开饿了么商家版 |
| 文字点击 | clickText() | 点击指定文本的元素 |
| 坐标点击 | clickPoint() | 点击指定坐标 |
| 滑动屏幕 | swipeScreen() | 上/下/左/右滑动 |
| 截图 | captureScreen() | 保存截图到手机 |
| 处理弹窗 | handleSecurityCheck() | 处理安全检测 |

### 预设流程

| 流程 | 函数 | 说明 |
|------|------|------|
| 每日数据采集 | dailyDataCollection() | 自动采集首页/订单/商品/营业数据 |
| 点击测试 | testClick() | 测试各Tab点击 |

## 自定义配置

在脚本开头修改配置：

```javascript
const CONFIG = {
    APP_PACKAGE: "me.ele.napos",  // 饿了么包名
    WAIT_SHORT: 500,              // 短等待(毫秒)
    WAIT_MEDIUM: 1000,           // 中等待(毫秒)
    WAIT_LONG: 2000,             // 长等待(毫秒)
    SWIPE_DURATION: 300,          // 滑动时长(毫秒)
    MAX_RETRIES: 3,              // 点击重试次数
};
```

## 常见问题

### Q: 提示"无障碍服务未开启"
A: 请在系统设置 → 无障碍 → 开启 AutoJS 服务

### Q: 点击没反应
A: 尝试修改 `MAX_RETRIES` 增加重试次数

### Q: 截图保存失败
A: 确保手机存储权限已开启

### Q: 如何查看日志
A: AutoJS 底部有日志输出区域

## 进阶开发

### 查找元素

```javascript
// 按文本查找
text("首页").findOne();

// 按ID查找
id("com.me.ele.napos:id/tab").findOne();

// 按描述查找
description("设置").findOne();

// 包含文本
textContains("订单").findOne();
```

### 执行操作

```javascript
let element = text("确认").findOne();

// 点击
element.click();

// 长按
element.longClick();

// 获取文本
let text = element.text();

// 获取坐标
let bounds = element.bounds();
```

### 等待元素

```javascript
// 等待出现
text("加载中").waitFor();

// 等待消失
text("加载中").waitVanish();
```

## 技术原理

AutoJS 通过 Android 无障碍服务实现自动化：

1. **获取界面信息**：通过 `AccessibilityService.getRootInActiveWindow()` 获取完整UI树
2. **查找元素**：通过 `findAccessibilityNodeInfosByText()` 等方法查找目标
3. **执行操作**：通过 `AccessibilityNodeInfo.performAction()` 执行点击等操作

这种方式绕过了APP的ADB检测，因为操作来自系统无障碍服务，APP无法区分。

## 下一步

1. 在云手机上安装 AutoJS
2. 导入并运行脚本
3. 测试各个功能
4. 根据需要自定义修改
