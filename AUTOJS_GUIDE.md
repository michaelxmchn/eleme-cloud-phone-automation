# AutoJS 自动化方案 v3.0

## 功能清单

| 功能 | 函数 | 示例 |
|------|------|------|
| ✅ 推广金额设置 | `setPromotionAmount(50)` | 设置50元日预算 |
| ✅ 批量涨价 | `batchAdjustPrice(10)` | 涨10% |
| ✅ 批量降价 | `batchAdjustPrice(-5)` | 降5% |
| ✅ 单品调价 | `modifyProductPrice("商品名", 28)` | 指定商品改价 |
| ✅ 切换页面 | `goToTab("商品")` | 首页/订单/商品/我的 |
| ✅ 数据采集 | 自动截图 | 保存到手机相册 |

## 快速开始

### 1. 安装 AutoJS
在云手机应用商店搜索 "AutoJS" 并安装

### 2. 开启无障碍服务
- 设置 → 无障碍 → 开启 AutoJS

### 3. 导入运行
- 将脚本导入 AutoJS
- 点击运行

## 函数调用方法

### 推广金额设置
```javascript
// 设置日推广预算 50 元
setPromotionAmount(50);
```

### 批量调价
```javascript
// 批量涨价 10%
batchAdjustPrice(10);

// 批量降价 5%
batchAdjustPrice(-5);
```

### 单品调价
```javascript
// 修改"宫保鸡丁"为28元
modifyProductPrice("宫保鸡丁", 28);
```

## 修改运行哪个功能

打开 `eleme_autojs.js`，找到底部的 `main()` 函数，取消注释你想执行的功能：

```javascript
function main() {
    // 取消注释其中一个：
    
    // 1. 设置推广金额
    setPromotionAmount(50);
    
    // 2. 批量涨价
    // batchAdjustPrice(10);
    
    // 3. 批量降价
    // batchAdjustPrice(-5);
    
    // 4. 修改单品价格
    // modifyProductPrice("宫保鸡丁", 28);
}
```

## 截图保存位置

所有截图保存在：`/sdcard/screenshots/eleme/`

## 问题排查

| 问题 | 解决方法 |
|------|----------|
| 点击无效 | 检查无障碍服务是否开启 |
| 找不到元素 | 尝试滑动屏幕后再操作 |
| 输入失败 | 确保输入框可编辑 |
