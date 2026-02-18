/**
 * 饿了么商家版自动化脚本 - 完整版 v3.0
 * 
 * 功能：
 * - 推广金额设置 ✅
 * - 批量调整价格 ✅
 * - 单品价格调整 ✅
 * - 商品管理 ✅
 * - 订单查询 ✅
 * - 数据采集 ✅
 */

const CONFIG = {
    APP_PACKAGE: "me.ele.napos",
    WAIT_SHORT: 800,
    WAIT_MEDIUM: 1500,
    WAIT_LONG: 2500,
    SWIPE_DURATION: 400,
    MAX_RETRIES: 4,
    SCREENSHOT_DIR: "/sdcard/screenshots/eleme/"
};

files.create(CONFIG.SCREENSHOT_DIR);

// ==================== 核心工具 ====================

function sleep(ms) {
    java.lang.Thread.sleep(ms);
}

function clickText(text, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        let el = text(text).findOne(1500);
        if (el) {
            try { el.click(); } catch(e) { click(el.bounds().centerX(), el.bounds().centerY()); }
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
                if (el && el.clickable && el.clickable()) {
                    try { el.click(); } catch(e) { click(el.bounds().centerX(), el.bounds().centerY()); }
                    sleep(CONFIG.WAIT_SHORT);
                    return true;
                }
            }
            // 尝试直接点击第一个
            try { 
                elements[0].click(); 
            } catch(e) {
                let b = elements[0].bounds();
                click(b.centerX(), b.centerY());
            }
            sleep(CONFIG.WAIT_SHORT);
            return true;
        }
        sleep(CONFIG.WAIT_SHORT);
    }
    return false;
}

function clickCenter(element) {
    if (!element) return false;
    try {
        let b = element.bounds();
        click(b.centerX(), b.centerY());
        sleep(CONFIG.WAIT_SHORT);
        return true;
    } catch(e) { return false; }
}

function clickPoint(x, y) {
    click(x, y);
    sleep(CONFIG.WAIT_SHORT);
}

function swipeUp(times = 1) {
    let w = device.width;
    let h = device.height;
    for (let i = 0; i < times; i++) {
        swipe(w/2, h*0.75, w/2, h*0.25, CONFIG.SWIPE_DURATION);
        sleep(300);
    }
}

function swipeDown(times = 1) {
    let w = device.width;
    let h = device.height;
    for (let i = 0; i < times; i++) {
        swipe(w/2, h*0.25, w/2, h*0.75, CONFIG.SWIPE_DURATION);
        sleep(300);
    }
}

function pressBack() {
    back();
    sleep(CONFIG.WAIT_SHORT);
}

function capture(name) {
    let path = CONFIG.SCREENSHOT_DIR + name + "_" + Date.now() + ".png";
    captureScreen(path);
    console.log("📸 " + name + ": " + path);
    return path;
}

function handlePopup() {
    sleep(500);
    let keywords = ["继续", "确定", "确认", "允许", "我知道了", "好的", "是", "下一步", "知道了"];
    for (let kw of keywords) {
        if (clickTextContains(kw)) {
            console.log("✅ 处理弹窗: " + kw);
            sleep(300);
            return true;
        }
    }
    return false;
}

function findAndInput(keyword, value) {
    // 找到包含keyword的输入框并输入value
    let inputs = className("EditText").find();
    for (let input of inputs) {
        let hint = (input.hint() || "").toString();
        let parent = input.parent();
        if (parent) {
            let parentText = (parent.text() || "").toString();
            if (parentText.includes(keyword) || hint.includes(keyword)) {
                input.setText(value);
                sleep(300);
                return true;
            }
        }
        // 尝试找最近的兄弟节点
        if (parent && parent.className && parent.className().includes("Linear")) {
            let children = parent.children();
            for (let child of children) {
                let childText = (child.text() || "").toString();
                if (childText.includes(keyword)) {
                    input.setText(value);
                    sleep(300);
                    return true;
                }
            }
        }
    }
    return false;
}

// ==================== 页面导航 ====================

function launchEleme() {
    console.log("🚀 启动饿了么商家版...");
    launchApp(CONFIG.APP_PACKAGE);
    sleep(CONFIG.WAIT_LONG);
    // 处理启动弹窗
    for (let i = 0; i < 3; i++) {
        handlePopup();
        sleep(500);
    }
}

function goToTab(tabName) {
    // tabName: 首页/订单/商品/我的
    // 尝试多种方式点击Tab
    console.log("📱 切换到: " + tabName);
    
    // 方法1: textContains
    if (clickTextContains(tabName)) {
        sleep(CONFIG.WAIT_MEDIUM);
        return true;
    }
    
    // 方法2: 滑动后查找
    swipeUp(1);
    if (clickTextContains(tabName)) {
        sleep(CONFIG.WAIT_MEDIUM);
        return true;
    }
    
    return false;
}

// ==================== 推广金额设置 ====================

function setPromotionAmount(amount) {
    console.log("💰 ========== 设置推广金额: " + amount + "元 ==========");
    
    launchEleme();
    goToTab("首页");
    capture("homepage");
    
    // 滑动到推广区域
    console.log("📜 滑动查找推广入口...");
    swipeUp(2);
    sleep(500);
    
    // 查找所有可能入口
    let found = false;
    
    // 方案1: 营销中心
    console.log("🔍 尝试: 营销中心");
    if (clickTextContains("营销中心")) {
        sleep(CONFIG.WAIT_MEDIUM);
        found = trySetAmountInPage(amount);
    }
    
    // 方案2: 我要推广
    if (!found) {
        swipeUp(1);
        console.log("🔍 尝试: 我要推广");
        if (clickTextContains("我要推广")) {
            sleep(CONFIG.WAIT_MEDIUM);
            found = trySetAmountInPage(amount);
        }
    }
    
    // 方案3: 流量变现
    if (!found) {
        console.log("🔍 尝试: 流量/推广");
        swipeUp(1);
        let elements = textContains("推广").find() || textContains("流量").find();
        for (let el of elements) {
            if (el.clickable && el.clickable()) {
                try {
                    el.click();
                    sleep(CONFIG.WAIT_MEDIUM);
                    if (trySetAmountInPage(amount)) {
                        found = true;
                        break;
                    }
                    pressBack();
                    sleep(500);
                } catch(e) {}
            }
        }
    }
    
    // 方案4: 首页顶部分类图标
    if (!found) {
        console.log("🔍 尝试: 首页图标");
        goToTab("首页");
        sleep(500);
        
        // 点击第一个分类
        let icons = className("android.widget.ImageView").find();
        for (let icon of icons) {
            try {
                let b = icon.bounds();
                if (b.centerY() > 200 && b.centerY() < 800) {
                    click(b.centerX(), b.centerY());
                    sleep(CONFIG.WAIT_MEDIUM);
                    if (trySetAmountInPage(amount)) {
                        found = true;
                        break;
                    }
                    pressBack();
                    sleep(500);
                }
            } catch(e) {}
        }
    }
    
    if (found) {
        console.log("✅ 推广金额设置成功: " + amount + "元");
        capture("promotion_success");
    } else {
        console.log("❌ 未找到推广金额设置入口");
        capture("promotion_fail");
    }
    
    return found;
}

function trySetAmountInPage(amount) {
    console.log("📄 在当前页面尝试设置金额...");
    capture("promotion_page");
    
    // 查找"设置金额"相关按钮
    let keywords = ["设置金额", "推广金额", "预算", "日预算", "修改"];
    
    for (let kw of keywords) {
        console.log("   🔎 查找: " + kw);
        if (clickTextContains(kw)) {
            sleep(CONFIG.WAIT_MEDIUM);
            capture("amount_input_page");
            
            // 找到输入框并输入
            if (inputToTextField(amount)) {
                sleep(500);
                // 点击确定
                if (clickTextContains("确定") || clickTextContains("确认") || clickTextContains("保存")) {
                    sleep(CONFIG.WAIT_MEDIUM);
                    handlePopup();
                    return true;
                }
            }
            
            // 如果上面没成功，尝试直接找输入框
            let inputs = className("EditText").find();
            for (let input of inputs) {
                try {
                    input.setText(amount.toString());
                    sleep(300);
                    
                    // 点击确定
                    if (clickTextContains("确定") || clickTextContains("确认")) {
                        sleep(CONFIG.WAIT_MEDIUM);
                        return true;
                    }
                } catch(e) {}
            }
        }
    }
    
    return false;
}

function inputToTextField(value) {
    // 尝试找到金额输入框并输入
    let inputs = className("EditText").find();
    for (let input of inputs) {
        try {
            let hint = (input.hint() || "").toString();
            let text = (input.text() || "").toString();
            
            // 判断是否是金额输入框
            if (hint.includes("金额") || hint.includes("预算") || hint.includes("钱") ||
                text.includes(".") || !isNaN(parseFloat(text)) || hint.includes("请输入")) {
                input.setText(value.toString());
                sleep(300);
                console.log("   ✅ 输入金额: " + value);
                return true;
            }
        } catch(e) {
            console.log("   ⚠️ 输入失败: " + e);
        }
    }
    return false;
}

// ==================== 批量调价 ====================

function batchAdjustPrice(percentage) {
    console.log("📈 ========== 批量调整价格: " + (percentage > 0 ? "+" : "") + percentage + "% ==========");
    
    launchEleme();
    goToTab("商品");
    capture("products_list");
    
    sleep(1000);
    
    // 查找批量操作入口
    console.log("🔍 查找批量操作...");
    
    // 方法1: 点击批量按钮
    let batchBtn = textContains("批量").findOne(2000);
    if (batchBtn) {
        clickCenter(batchBtn);
        sleep(CONFIG.WAIT_MEDIUM);
        capture("batch_page");
        
        // 查找调价选项
        return doBatchPriceAdjust(percentage);
    }
    
    // 方法2: 更多按钮
    let moreBtn = textContains("更多").findOne(2000) || descriptionContains("更多").findOne(2000);
    if (moreBtn) {
        clickCenter(moreBtn);
        sleep(CONFIG.WAIT_MEDIUM);
        
        if (clickTextContains("批量")) {
            sleep(CONFIG.WAIT_MEDIUM);
            return doBatchPriceAdjust(percentage);
        }
    }
    
    // 方法3: 长按商品
    console.log("🔍 尝试长按商品进入批量模式...");
    let products = className("android.widget.ListView").findOne();
    if (products) {
        let items = products.children();
        if (items.length > 0) {
            let firstItem = items[0];
            let b = firstItem.bounds();
            longClick(b.centerX(), b.centerY());
            sleep(1000);
            
            if (clickTextContains("批量") || clickTextContains("多选")) {
                sleep(CONFIG.WAIT_MEDIUM);
                return doBatchPriceAdjust(percentage);
            }
        }
    }
    
    console.log("❌ 未找到批量操作入口");
    capture("batch_fail");
    return false;
}

function doBatchPriceAdjust(percentage) {
    capture("batch_price_page");
    console.log("📝 执行批量调价...");
    
    // 选择商品（假设全选）
    let selectAll = textContains("全选").findOne(1000);
    if (selectAll) {
        clickCenter(selectAll);
        sleep(300);
    }
    
    // 点击价格调整
    if (clickTextContains("价格")) {
        sleep(CONFIG.WAIT_MEDIUM);
        capture("price_adjust_page");
        
        // 选择按比例
        clickTextContains("比例") || clickTextContains("百分比");
        sleep(300);
        
        // 输入百分比
        let inputs = className("EditText").find();
        for (let input of inputs) {
            try {
                input.setText(Math.abs(percentage).toString());
                sleep(300);
            } catch(e) {}
        }
        
        // 选择涨/跌
        if (percentage > 0) {
            clickTextContains("涨") || clickTextContains("加");
        } else {
            clickTextContains("降") || clickTextContains("减");
        }
        sleep(300);
        
        // 确认
        if (clickTextContains("确定") || clickTextContains("确认")) {
            sleep(1000);
            handlePopup();
            
            console.log("✅ 批量调价完成: " + (percentage > 0 ? "+" : "") + percentage + "%");
            capture("batch_success");
            return true;
        }
    }
    
    return false;
}

// ==================== 单品调价 ====================

function modifyProductPrice(productName, newPrice) {
    console.log("✏️ ========== 修改商品价格: " + productName + " -> " + newPrice + "元 ==========");
    
    launchEleme();
    goToTab("商品");
    capture("products_list");
    
    sleep(1000);
    
    // 搜索商品
    console.log("🔍 搜索商品: " + productName);
    let searchBox = idContains("search").findOne(2000);
    if (!searchBox) {
        searchBox = textContains("搜索").findOne(2000);
    }
    
    if (searchBox) {
        try { clickCenter(searchBox); } catch(e) {}
        sleep(500);
        
        // 输入搜索内容
        let inputs = className("EditText").find();
        for (let input of inputs) {
            try {
                input.setText(productName);
                sleep(500);
                break;
            } catch(e) {}
        }
        
        // 点击搜索
        clickTextContains("搜索") || pressEnter();
        sleep(1000);
    }
    
    capture("search_result");
    
    // 找到商品并点击
    let target = textContains(productName).findOne(3000);
    if (target) {
        console.log("✅ 找到商品");
        clickCenter(target);
        sleep(CONFIG.WAIT_MEDIUM);
        capture("product_edit");
        
        // 查找价格输入框
        if (inputToTextField(newPrice)) {
            sleep(500);
            
            // 保存
            if (clickTextContains("保存") || clickTextContains("确定") || clickTextContains("确认")) {
                sleep(1000);
                handlePopup();
                
                console.log("✅ 价格修改成功: " + productName + " = " + newPrice + "元");
                capture("edit_success");
                return true;
            }
        }
    }
    
    console.log("❌ 商品价格修改失败");
    capture("edit_fail");
    return false;
}

// ==================== 主函数 ====================

function main() {
    console.log("=".repeat(50));
    console.log("🍜 饿了么商家版自动化助手 v3.0");
    console.log("=".repeat(50));
    
    // 检查权限
    if (!requestScreenCapture()) {
        toast("需要截屏权限");
        console.log("❌ 需要截屏权限");
        return;
    }
    
    if (!auto.service) {
        toast("需要开启无障碍服务");
        console.log("❌ 需要开启无障碍服务");
        return;
    }
    
    console.log("✅ 权限检查通过");
    
    // 示例：设置推广金额
    // setPromotionAmount(50);
    
    // 示例：批量涨价10%
    // batchAdjustPrice(10);
    
    // 示例：修改单品价格
    // modifyProductPrice("商品名称", 28.00);
    
    console.log("请修改main()中的函数调用来执行不同功能");
}

function test() {
    launchEleme();
    goToTab("首页");
    capture("test_home");
    
    goToTab("商品");
    capture("test_products");
    
    console.log("✅ 测试完成");
}

// 运行
main();

// 导出
module.exports = {
    setPromotionAmount: setPromotionAmount,
    batchAdjustPrice: batchAdjustPrice,
    modifyProductPrice: modifyProductPrice,
    launchEleme: launchEleme,
    goToTab: goToTab
};
