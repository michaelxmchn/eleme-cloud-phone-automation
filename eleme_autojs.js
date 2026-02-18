/**
 * 饿了么商家版自动化脚本 - 完整版
 * AutoJS版本 v2.0
 * 
 * 功能：
 * - 每日数据采集
 * - 推广金额设置
 * - 商品价格批量调整
 * - 订单管理
 * - 营业设置
 */

// ==================== 配置 ====================
const CONFIG = {
    APP_PACKAGE: "me.ele.napos",
    WAIT_SHORT: 500,
    WAIT_MEDIUM: 1000,
    WAIT_LONG: 2000,
    SWIPE_DURATION: 300,
    MAX_RETRIES: 3,
    SCREENSHOT_DIR: "/sdcard/screenshots/eleme/"
};

// 确保截图目录存在
files.create(CONFIG.SCREENSHOT_DIR);

// ==================== 工具函数 ====================

function clickText(text, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        let el = text(text).findOne(1000);
        if (el && el.clickable()) {
            el.click();
            sleep(CONFIG.WAIT_SHORT);
            return true;
        }
        // 尝试直接点击
        let elements = text(text).find();
        if (elements.length > 0) {
            elements[0].click();
            sleep(CONFIG.WAIT_SHORT);
            return true;
        }
        sleep(CONFIG.WAIT_SHORT);
    }
    return false;
}

function clickTextContains(text, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        let elements = textContains(text).find();
        if (elements.length > 0) {
            for (let el of elements) {
                if (el.clickable()) {
                    el.click();
                    sleep(CONFIG.WAIT_SHORT);
                    return true;
                }
            }
            elements[0].click();
            sleep(CONFIG.WAIT_SHORT);
            return true;
        }
        sleep(CONFIG.WAIT_SHORT);
    }
    return false;
}

function clickId(id, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        let el = id(id).findOne(1000);
        if (el && el.clickable()) {
            el.click();
            sleep(CONFIG.WAIT_SHORT);
            return true;
        }
        sleep(CONFIG.WAIT_SHORT);
    }
    return false;
}

function clickPoint(x, y) {
    click(x, y);
    sleep(CONFIG.WAIT_SHORT);
}

function swipeScreen(direction) {
    let w = device.width;
    let h = device.height;
    let startX = w/2, startY = h*0.8, endX = w/2, endY = h*0.2;
    
    if (direction === "down") {
        startY = h*0.2; endY = h*0.8;
    } else if (direction === "left") {
        startX = w*0.8; startY = h/2; endX = w*0.2; endY = h/2;
    } else if (direction === "right") {
        startX = w*0.2; startY = h/2; endX = w*0.8; endY = h/2;
    }
    
    swipe(startX, startY, endX, endY, CONFIG.SWIPE_DURATION);
    sleep(CONFIG.WAIT_SHORT);
}

function inputText(element, text) {
    if (!element) return false;
    element.setText(text);
    sleep(CONFIG.WAIT_SHORT);
    return true;
}

function pressBack() {
    back();
    sleep(CONFIG.WAIT_SHORT);
}

function pressHome() {
    home();
    sleep(CONFIG.WAIT_SHORT);
}

function captureScreen(name) {
    let path = CONFIG.SCREENSHOT_DIR + name + "_" + new Date().getTime() + ".png";
    captureScreen(path);
    console.log("📸 截图: " + path);
    return path;
}

function handleDialog() {
    // 处理各种弹窗
    sleep(500);
    
    // 继续/允许按钮
    if (clickTextContains("继续")) return true;
    if (clickTextContains("允许")) return true;
    if (clickTextContains("确定")) return true;
    if (clickTextContains("确认")) return true;
    if (clickTextContains("我知道了")) return true;
    
    return false;
}

function waitForApp(pkg, timeout) {
    let start = new Date().getTime();
    while (new Date().getTime() - start < timeout) {
        if (currentPackage() === pkg) return true;
        sleep(200);
    }
    return false;
}

function launchApp() {
    launchApp(CONFIG.APP_PACKAGE);
    waitForApp(CONFIG.APP_PACKAGE, CONFIG.WAIT_LONG);
    sleep(1000);
}

// ==================== 首页操作 ====================

function goToHomepage() {
    console.log("🏠 前往首页...");
    // 点击首页Tab
    clickTextContains("首页");
    sleep(CONFIG.WAIT_MEDIUM);
    captureScreen("homepage");
    return true;
}

// ==================== 推广相关 ====================

/**
 * 设置推广金额
 */
function setPromotionAmount(amount) {
    console.log("💰 设置推广金额: " + amount);
    
    // 确保在首页
    goToHomepage();
    
    // 找到推广/营销入口
    // 尝试多种方式找到推广按钮
    console.log("寻找推广入口...");
    
    // 方法1: 点击营销中心
    if (clickTextContains("营销中心")) {
        sleep(CONFIG.WAIT_MEDIUM);
    }
    
    // 方法2: 点击首页的推广横幅
    // 通常在首页中部或底部
    swipeScreen("up");
    sleep(500);
    
    // 方法3: 查找"我要推广"按钮
    if (clickTextContains("我要推广")) {
        sleep(CONFIG.WAIT_MEDIUM);
    }
    
    // 方法4: 查找"推广"相关文字
    let promotionElements = textContains("推广").find();
    console.log("找到 " + promotionElements.length + " 个推广相关元素");
    
    for (let i = 0; i < Math.min(promotionElements.length, 5); i++) {
        let el = promotionElements[i];
        if (el && el.clickable()) {
            el.click();
            sleep(CONFIG.WAIT_MEDIUM);
            
            // 尝试找到金额设置
            if (clickTextContains("设置金额") || clickTextContains("推广金额")) {
                sleep(CONFIG.WAIT_MEDIUM);
                
                // 输入金额
                // 查找输入框
                let inputField = idContains("edit").findOne(2000) || 
                                className("EditText").findOne(2000);
                
                if (inputField) {
                    // 清空并输入新金额
                    inputField.setText("");
                    sleep(200);
                    inputField.setText(amount);
                    sleep(300);
                    
                    // 点击确认
                    clickTextContains("确定") || clickTextContains("确认");
                    sleep(CONFIG.WAIT_MEDIUM);
                    
                    console.log("✅ 推广金额设置完成: " + amount);
                    captureScreen("promotion_set");
                    return true;
                }
            }
            
            captureScreen("promotion_page");
        }
    }
    
    console.log("❌ 未找到推广金额设置入口");
    return false;
}

/**
 * 打开推广页面
 */
function openPromotionPage() {
    console.log("📊 打开推广页面...");
    
    goToHomepage();
    swipeScreen("up");
    sleep(500);
    
    // 尝试多种方式进入推广
    let attempts = [
        () => clickTextContains("营销中心"),
        () => clickTextContains("我要推广"),
        () => clickTextContains("推广"),
        () => clickTextContains("流量"),
        () => clickTextContains("客流")
    ];
    
    for (let fn of attempts) {
        if (fn()) {
            sleep(CONFIG.WAIT_MEDIUM);
            captureScreen("promotion");
            return true;
        }
    }
    
    return false;
}

// ==================== 商品管理 ====================

/**
 * 进入商品页面
 */
function goToProducts() {
    console.log("📦 进入商品页面...");
    clickTextContains("商品");
    sleep(CONFIG.WAIT_MEDIUM);
    captureScreen("products_list");
    return true;
}

/**
 * 批量调整价格
 * @param {number} percentage - 调整百分比，正数涨价，负数降价
 */
function batchAdjustPrice(percentage) {
    console.log("📈 批量调整价格: " + (percentage > 0 ? "+" : "") + percentage + "%");
    
    goToProducts();
    
    // 点击编辑/批量操作
    sleep(500);
    
    // 查找批量操作入口
    let batchEdit = textContains("批量").findOne(2000) || 
                   idContains("batch").findOne(2000);
    
    if (batchEdit) {
        batchEdit.click();
        sleep(CONFIG.WAIT_MEDIUM);
    } else {
        console.log("未找到批量操作，尝试单个商品调整...");
        return adjustSingleProductPrice(percentage);
    }
    
    // 选择调价方式
    if (clickTextContains("调整价格") || clickTextContains("价格")) {
        sleep(CONFIG.WAIT_MEDIUM);
        
        // 选择百分比调整
        clickTextContains("按比例") || clickTextContains("百分比");
        sleep(300);
        
        // 输入百分比
        let inputField = className("EditText").findOne(2000);
        if (inputField) {
            inputField.setText(Math.abs(percentage).toString());
            sleep(300);
            
            // 选择涨价或降价
            if (percentage > 0) {
                clickTextContains("涨价") || clickTextContains("上调");
            } else {
                clickTextContains("降价") || clickTextContains("下调");
            }
            sleep(300);
            
            // 确认
            clickTextContains("确定") || clickTextContains("确认");
            sleep(CONFIG.WAIT_MEDIUM);
            
            // 处理可能的确认弹窗
            handleDialog();
            
            console.log("✅ 价格调整完成");
            captureScreen("price_adjusted");
            return true;
        }
    }
    
    console.log("❌ 价格调整失败");
    return false;
}

/**
 * 调整单个商品价格
 */
function adjustSingleProductPrice(newPrice) {
    console.log("💵 调整单个商品价格: " + newPrice);
    
    // 进入商品列表后，滑动找到商品
    swipeScreen("up");
    sleep(500);
    
    // 点击第一个商品进入编辑
    let productItems = className("android.widget.ListView").findOne();
    if (productItems) {
        let children = productItems.children();
        if (children.length > 0) {
            children[0].click();
            sleep(CONFIG.WAIT_MEDIUM);
            
            // 找到价格编辑框
            let priceField = textContains("价格").findOne(2000);
            if (priceField) {
                // 尝试找到价格输入框
                let inputField = className("EditText").findOne(2000);
                if (inputField) {
                    inputField.setText(newPrice.toString());
                    sleep(300);
                    
                    clickTextContains("确定") || clickTextContains("保存");
                    sleep(CONFIG.WAIT_MEDIUM);
                    
                    console.log("✅ 单个商品价格调整完成");
                    return true;
                }
            }
        }
    }
    
    return false;
}

/**
 * 修改指定商品价格
 * @param {string} productName - 商品名称
 * @param {number} newPrice - 新价格
 */
function modifyProductPrice(productName, newPrice) {
    console.log("✏️ 修改商品 [" + productName + "] 价格: " + newPrice);
    
    goToProducts();
    
    // 搜索商品
    let searchBox = idContains("search").findOne(2000) || 
                   textContains("搜索").findOne(2000);
    if (searchBox) {
        searchBox.setText(productName);
        sleep(500);
    }
    
    // 找到目标商品
    let targetProduct = textContains(productName).findOne(3000);
    if (targetProduct) {
        // 点击进入编辑
        targetProduct.click();
        sleep(CONFIG.WAIT_MEDIUM);
        
        // 找到价格输入框
        let priceInputs = className("EditText").find();
        for (let input of priceInputs) {
            let hint = input.hint() || "";
            let text = input.text() || "";
            if (hint.includes("价") || text.includes(".") || !isNaN(parseFloat(text))) {
                input.setText(newPrice.toString());
                sleep(300);
                break;
            }
        }
        
        // 保存
        clickTextContains("保存") || clickTextContains("确定");
        sleep(CONFIG.WAIT_MEDIUM);
        
        console.log("✅ 商品价格已修改");
        captureScreen("product_edited");
        return true;
    }
    
    console.log("❌ 未找到商品: " + productName);
    return false;
}

// ==================== 订单管理 ====================

function goToOrders() {
    console.log("📋 进入订单页面...");
    clickTextContains("订单");
    sleep(CONFIG.WAIT_MEDIUM);
    captureScreen("orders");
    return true;
}

function getTodayOrders() {
    console.log("📊 获取今日订单...");
    
    goToOrders();
    
    // 查找今日订单统计
    let orderElements = textContains("今日").find();
    for (let el of orderElements) {
        console.log(el.text());
    }
    
    captureScreen("today_orders");
    return true;
}

// ==================== 营业设置 ====================

function goToBusinessSettings() {
    console.log("⚙️ 进入营业设置...");
    
    goToHomepage();
    
    // 方法1: 右上角菜单
    // 点击更多/菜单按钮
    let moreBtn = id("more").findOne(1000) || 
                  descriptionContains("更多").findOne(1000) ||
                  textContains("更多").findOne(1000);
    
    if (moreBtn) {
        moreBtn.click();
        sleep(CONFIG.WAIT_MEDIUM);
    }
    
    // 方法2: 在首页滑动查找
    swipeScreen("up");
    sleep(300);
    
    // 方法3: 点击设置入口
    let settingsEntry = textContains("营业设置").findOne(2000) ||
                       textContains("店铺设置").findOne(2000);
    
    if (settingsEntry) {
        settingsEntry.click();
        sleep(CONFIG.WAIT_MEDIUM);
        captureScreen("business_settings");
        return true;
    }
    
    console.log("❌ 未找到营业设置入口");
    return false;
}

/**
 * 设置店铺营业状态
 * @param {boolean} isOpen - true营业中，false休息中
 */
function setBusinessStatus(isOpen) {
    console.log((isOpen ? "🏪 设为营业中" : "💤 设为休息中"));
    
    if (goToBusinessSettings()) {
        sleep(500);
        
        // 找到营业开关
        let statusSwitch = textContains("营业").findOne(2000);
        if (statusSwitch) {
            // 尝试点击开关
            let parent = statusSwitch.parent();
            if (parent && parent.className().includes("Switch")) {
                parent.click();
            } else {
                statusSwitch.click();
            }
            
            sleep(CONFIG.WAIT_MEDIUM);
            handleDialog();
            
            console.log("✅ 营业状态已设置");
            captureScreen("status_changed");
            return true;
        }
    }
    
    return false;
}

// ==================== 主流程 ====================

/**
 * 每日数据采集
 */
function dailyDataCollection() {
    console.log("=".repeat(50));
    console.log("🚀 开始每日数据采集");
    console.log("=".repeat(50));
    
    if (currentPackage() !== CONFIG.APP_PACKAGE) {
        launchApp();
    }
    
    // 处理弹窗
    handleDialog();
    
    // 1. 首页数据
    goToHomepage();
    
    // 2. 订单数据
    getTodayOrders();
    
    // 3. 商品列表
    goToProducts();
    
    console.log("✅ 每日数据采集完成");
    console.log("=".repeat(50));
}

/**
 * 完整营业流程
 */
function fullBusinessWorkflow() {
    console.log("=".repeat(50));
    console.log("🚀 完整营业流程");
    console.log("=".repeat(50));
    
    if (currentPackage() !== CONFIG.APP_PACKAGE) {
        launchApp();
    }
    
    handleDialog();
    
    // 1. 设置推广金额示例
    setPromotionAmount(50);
    
    // 2. 调整价格示例（涨价10%）
    batchAdjustPrice(10);
    
    // 3. 设置营业状态
    setBusinessStatus(true);
    
    console.log("✅ 营业流程执行完成");
    console.log("=".repeat(50));
}

/**
 * 测试所有功能
 */
function testAll() {
    console.log("🧪 测试所有功能");
    
    // 请求权限
    if (!requestScreenCapture()) {
        toast("需要截屏权限");
        return;
    }
    
    if (!auto.service) {
        toast("需要开启无障碍服务");
        return;
    }
    
    launchApp();
    sleep(2000);
    
    // 测试各个功能
    console.log("\n1. 测试首页...");
    goToHomepage();
    
    console.log("\n2. 测试订单...");
    goToOrders();
    
    console.log("\n3. 测试商品...");
    goToProducts();
    
    console.log("\n4. 测试滑动...");
    swipeScreen("up");
    swipeScreen("down");
    
    console.log("\n5. 测试返回...");
    pressBack();
    
    console.log("\n✅ 测试完成");
}

// ==================== 运行入口 ====================

function main() {
    if (!requestScreenCapture()) {
        toast("需要截屏权限");
        return;
    }
    
    if (!auto.service) {
        toast("需要开启无障碍服务");
        console.log("请先在设置中开启无障碍服务");
        return;
    }
    
    // 运行每日数据采集
    dailyDataCollection();
    
    // 或者运行完整流程
    // fullBusinessWorkflow();
    
    // 或者测试
    // testAll();
}

// 直接运行
main();

// ==================== 导出 ====================
module.exports = {
    launchApp: launchApp,
    goToHomepage: goToHomepage,
    goToOrders: goToOrders,
    goToProducts: goToProducts,
    goToBusinessSettings: goToBusinessSettings,
    setPromotionAmount: setPromotionAmount,
    batchAdjustPrice: batchAdjustPrice,
    modifyProductPrice: modifyProductPrice,
    setBusinessStatus: setBusinessStatus,
    dailyDataCollection: dailyDataCollection,
    fullBusinessWorkflow: fullBusinessWorkflow,
    testAll: testAll
};
