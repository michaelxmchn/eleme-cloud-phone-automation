/**
 * 饿了么商家版自动化脚本
 * AutoJS版本
 * 
 * 使用方法：
 * 1. 在云手机上安装 AutoJS 或 AutoJS Pro
 * 2. 导入此脚本
 * 3. 在设置中开启无障碍服务权限
 * 4. 运行脚本
 */

// ==================== 配置 ====================
const CONFIG = {
    // 包名
    APP_PACKAGE: "me.ele.napos",
    
    // 等待时间配置
    WAIT_SHORT: 500,    // 短等待 0.5秒
    WAIT_MEDIUM: 1000,  // 中等待 1秒
    WAIT_LONG: 2000,    // 长等待 2秒
    
    // 滑动配置
    SWIPE_DURATION: 300,
    
    // 点击重试次数
    MAX_RETRIES: 3,
};

// ==================== 工具函数 ====================

/**
 * 等待并点击指定文本的元素
 */
function clickText(text, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        let element = text(text);
        if (element.exists()) {
            element.click();
            sleep(CONFIG.WAIT_SHORT);
            return true;
        }
        sleep(CONFIG.WAIT_SHORT);
    }
    return false;
}

/**
 * 等待并点击指定ID的元素
 */
function clickId(id, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        let element = id(id);
        if (element.exists()) {
            element.click();
            sleep(CONFIG.WAIT_SHORT);
            return true;
        }
        sleep(CONFIG.WAIT_SHORT);
    }
    return false;
}

/**
 * 点击指定坐标
 */
function clickPoint(x, y) {
    click(x, y);
    sleep(CONFIG.WAIT_SHORT);
}

/**
 * 滑动屏幕
 * direction: up/down/left/right
 */
function swipeScreen(direction) {
    let w = device.width;
    let h = device.height;
    let startX, startY, endX, endY;
    
    switch(direction) {
        case "up":
            startX = w / 2;
            startY = h * 0.8;
            endX = w / 2;
            endY = h * 0.2;
            break;
        case "down":
            startX = w / 2;
            startY = h * 0.2;
            endX = w / 2;
            endY = h * 0.8;
            break;
        case "left":
            startX = w * 0.8;
            startY = h / 2;
            endX = w * 0.2;
            endY = h / 2;
            break;
        case "right":
            startX = w * 0.2;
            startY = h / 2;
            endX = w * 0.8;
            endY = h / 2;
            break;
    }
    
    swipe(startX, startY, endX, endY, CONFIG.SWIPE_DURATION);
    sleep(CONFIG.WAIT_SHORT);
}

/**
 * 查找并点击包含指定文本的元素
 */
function clickTextContains(text, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        let elements = textContains(text).find();
        if (elements.length > 0) {
            // 找到第一个可点击的元素
            for (let el of elements) {
                if (el.clickable()) {
                    el.click();
                    sleep(CONFIG.WAIT_SHORT);
                    return true;
                }
            }
            // 如果没找到可点击的，尝试直接点击
            elements[0].click();
            sleep(CONFIG.WAIT_SHORT);
            return true;
        }
        sleep(CONFIG.WAIT_SHORT);
    }
    return false;
}

/**
 * 等待页面加载完成
 */
function waitForPage(timeout) {
    let startTime = new Date().getTime();
    while (new Date().getTime() - startTime < timeout) {
        if (currentPackage() == CONFIG.APP_PACKAGE) {
            return true;
        }
        sleep(100);
    }
    return false;
}

/**
 * 启动APP
 */
function launchApp() {
    launchApp(CONFIG.APP_PACKAGE);
    sleep(CONFIG.WAIT_LONG);
}

/**
 * 返回键
 */
function pressBack() {
    back();
    sleep(CONFIG.WAIT_SHORT);
}

/**
 * 按Home键
 */
function pressHome() {
    home();
    sleep(CONFIG.WAIT_SHORT);
}

// ==================== 业务功能 ====================

/**
 * 获取首页数据
 */
function getHomepageData() {
    console.log("📊 获取首页数据...");
    
    // 点击首页Tab
    clickTextContains("首页");
    sleep(CONFIG.WAIT_MEDIUM);
    
    // 截图保存
    let timestamp = new Date().getTime();
    let screenshotPath = "/sdcard/screenshots/eleme_home_" + timestamp + ".png";
    captureScreen(screenshotPath);
    
    console.log("✅ 截图保存: " + screenshotPath);
    return true;
}

/**
 * 获取订单数据
 */
function getOrderData() {
    console.log("📋 获取订单数据...");
    
    // 点击订单Tab
    clickTextContains("订单");
    sleep(CONFIG.WAIT_MEDIUM);
    
    // 截图
    let timestamp = new Date().getTime();
    captureScreen("/sdcard/screenshots/eleme_order_" + timestamp + ".png");
    
    console.log("✅ 订单页面截图完成");
    return true;
}

/**
 * 获取商品列表
 */
function getProductList() {
    console.log("📦 获取商品列表...");
    
    // 点击商品Tab
    clickTextContains("商品");
    sleep(CONFIG.WAIT_MEDIUM);
    
    // 滑动查看更多
    for (let i = 0; i < 3; i++) {
        swipeScreen("up");
    }
    
    // 截图
    let timestamp = new Date().getTime();
    captureScreen("/sdcard/screenshots/eleme_product_" + timestamp + ".png");
    
    console.log("✅ 商品列表截图完成");
    return true;
}

/**
 * 获取营业数据
 */
function getBusinessData() {
    console.log("💰 获取营业数据...");
    
    // 点击右上角菜单
    // 由于这个按钮可能被检测，需要用不同方式尝试
    let menuButton = id("more").findOne();  // 可能的ID
    if (!menuButton) {
        menuButton = textContains("更多").findOne();
    }
    if (!menuButton) {
        menuButton = descriptionContains("更多").findOne();
    }
    
    if (menuButton) {
        menuButton.click();
        sleep(CONFIG.WAIT_MEDIUM);
        
        // 点击营业设置
        clickTextContains("营业设置");
        sleep(CONFIG.WAIT_MEDIUM);
        
        // 截图
        let timestamp = new Date().getTime();
        captureScreen("/sdcard/screenshots/eleme_business_" + timestamp + ".png");
        
        console.log("✅ 营业设置截图完成");
        return true;
    }
    
    console.log("❌ 未找到菜单按钮");
    return false;
}

/**
 * 处理安全检测弹窗
 */
function handleSecurityCheck() {
    console.log("🔒 检查安全检测弹窗...");
    
    // 查找"继续安装"或"允许"按钮
    let continueButton = textContains("继续").findOne(1000);
    if (continueButton) {
        continueButton.click();
        console.log("✅ 已点击继续按钮");
        return true;
    }
    
    let allowButton = textContains("允许").findOne(1000);
    if (allowButton) {
        allowButton.click();
        console.log("✅ 已点击允许按钮");
        return true;
    }
    
    console.log("ℹ️ 无安全检测弹窗");
    return false;
}

// ==================== 主流程 ====================

/**
 * 每日数据采集流程
 */
function dailyDataCollection() {
    console.log("=".repeat(50));
    console.log("🚀 开始每日数据采集");
    console.log("=".repeat(50));
    
    // 确保在APP中
    if (currentPackage() != CONFIG.APP_PACKAGE) {
        console.log("📱 启动饿了么商家版...");
        launchApp();
    }
    
    // 等待APP启动
    sleep(CONFIG.WAIT_LONG);
    
    // 处理可能的弹窗
    handleSecurityCheck();
    
    // 1. 获取首页数据
    getHomepageData();
    
    // 2. 获取订单数据
    getOrderData();
    
    // 3. 获取商品列表
    getProductList();
    
    // 4. 获取营业设置
    getBusinessData();
    
    console.log("=".repeat(50));
    console.log("✅ 每日数据采集完成！");
    console.log("=".repeat(50));
    
    // 返回首页
    clickTextContains("首页");
}

/**
 * 测试点击功能
 */
function testClick() {
    console.log("🧪 测试点击功能...");
    
    // 启动APP
    if (currentPackage() != CONFIG.APP_PACKAGE) {
        launchApp();
        sleep(CONFIG.WAIT_LONG);
    }
    
    // 点击首页
    console.log("点击首页...");
    clickTextContains("首页");
    sleep(CONFIG.WAIT_MEDIUM);
    
    // 点击订单
    console.log("点击订单...");
    clickTextContains("订单");
    sleep(CONFIG.WAIT_MEDIUM);
    
    // 点击商品
    console.log("点击商品...");
    clickTextContains("商品");
    sleep(CONFIG.WAIT_MEDIUM);
    
    // 测试滑动
    console.log("测试滑动...");
    swipeScreen("up");
    sleep(CONFIG.WAIT_SHORT);
    swipeScreen("down");
    
    console.log("✅ 测试完成");
}

// ==================== 运行入口 ====================

// 主函数
function main() {
    // 请求必要的权限
    if (!requestScreenCapture()) {
        toast("❌ 需要截屏权限");
        return;
    }
    
    // 确认无障碍服务已开启
    if (!auto.service) {
        toast("❌ 请先开启无障碍服务");
        console.log("请在设置中开启无障碍服务权限");
        return;
    }
    
    console.log("✅ 权限检查通过");
    
    // 运行每日数据采集
    dailyDataCollection();
}

// 如果直接运行此脚本
main();

// ==================== 对外导出 ====================
module.exports = {
    clickText: clickText,
    clickId: clickId,
    clickPoint: clickPoint,
    swipeScreen: swipeScreen,
    clickTextContains: clickTextContains,
    launchApp: launchApp,
    dailyDataCollection: dailyDataCollection,
    testClick: testClick,
};
