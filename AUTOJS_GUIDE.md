# AutoJS 自动化方案

## 方案介绍

使用 AutoJS 在云手机上直接运行 JavaScript 脚本，通过 Android 无障碍服务实现 UI 自动化。

## 功能清单

### ✅ 已实现功能

| 功能 | 函数 | 说明 |
|------|------|------|
| 每日数据采集 | `dailyDataCollection()` | 自动采集首页/订单/商品数据 |
| 推广金额设置 | `setPromotionAmount(amount)` | 设置推广金额 |
| 批量调价 | `batchAdjustPrice(percentage)` | 按百分比批量调整价格 |
| 单品调价 | `modifyProductPrice(name, price)` | 修改指定商品价格 |
| 营业状态 | `setBusinessStatus(isOpen)` | 设置营业中/休息中 |
| 订单查询 | `goToOrders()` | 进入订单页面 |
| 商品管理 | `goToProducts()` | 进入商品页面 |

## 使用步骤

### 步骤1：安装 AutoJS

在云手机上安装 AutoJS Pro 或免费版

### 步骤2：导入脚本

将 `eleme_autojs.js` 导入到 AutoJS

### 步骤3：开启无障碍服务

设置 → 无障碍 → 开启 AutoJS

### 步骤4：运行

在 AutoJS 中打开脚本，点击运行

## 函数调用示例

### 1. 设置推广金额 50 元
```javascript
setPromotionAmount(50);
```

### 2. 批量涨价 10%
```javascript
batchAdjustPrice(10);
```

### 3. 批量降价 5%
```javascript
batchAdjustPrice(-5);
```

### 4. 修改特定商品价格
```javascript
modifyProductPrice("宫保鸡丁", 28.00);
```

### 5. 设置营业中
```javascript
setBusinessStatus(true);  // true=营业中, false=休息中
```

### 6. 完整营业流程
```javascript
fullBusinessWorkflow();
```

### 7. 每日数据采集
```javascript
dailyDataCollection();
```

## 脚本结构

```
eleme_autojs.js
├── 配置 CONFIG
├── 工具函数
│   ├── clickText() - 点击文字
│   ├── clickTextContains() - 点击包含文字
│   ├── clickId() - 点击ID
│   ├── swipeScreen() - 滑动
│   ├── captureScreen() - 截图
│   └── handleDialog() - 处理弹窗
├── 首页操作
├── 推广相关
│   ├── setPromotionAmount() - 设置推广金额
│   └── openPromotionPage() - 打开推广页
├── 商品管理
│   ├── batchAdjustPrice() - 批量调价
│   ├── modifyProductPrice() - 单品调价
│   └── goToProducts() - 商品列表
├── 订单管理
│   └── goToOrders() - 订单页面
├── 营业设置
│   ├── goToBusinessSettings() - 营业设置
│   └── setBusinessStatus() - 营业状态
└── 主流程
    ├── dailyDataCollection() - 每日采集
    └── fullBusinessWorkflow() - 完整流程
```

## 常见问题

### Q: 点击没反应
A: 检查无障碍服务是否开启，尝试增加等待时间

### Q: 找不到元素
A: 使用 `swipeScreen("up")` 滑动屏幕后再试

### Q: 价格输入失败
A: 可能需要先清空输入框，脚本已处理

## 技术原理

AutoJS 通过无障碍服务：
1. 获取完整UI树
2. 查找目标元素
3. 执行操作（点击/输入等）

**绕过APP检测**，因为来自系统服务。
