/**
 * 饿了么商家版 - 简化版
 * 避免Storage.json问题
 */

// 检查权限
if (!requestScreenCapture()) {
    alert("需要截屏权限！");
    exit();
}

if (!auto.service) {
    alert("需要开启无障碍服务！");
    exit();
}

// 启动饿了么
function launchEleme() {
    launchApp("me.ele.napos");
    sleep(3000);
}

// 截图
function capture(name) {
    let path = "/sdcard/eleme_" + name + ".png";
    captureScreen(path);
    toast("截图: " + path);
}

// 点击
function tap(x, y) {
    click(x, y);
    sleep(500);
}

// 滑动
function swipeUp() {
    let w = device.width;
    let h = device.height;
    swipe(w/2, h*0.8, w/2, h*0.2, 400);
}

// ==================== 主程序 ====================

// 1. 启动APP
toast("启动饿了么...");
launchEleme();

// 2. 截图确认
capture("start");

// 3. 等待用户操作
alert("脚本已启动，请在手机上操作");

// 4. 简单测试 - 点击屏幕中心
// tap(device.width/2, device.height/2);

// 5. 再次截图
capture("end");

toast("完成！");
