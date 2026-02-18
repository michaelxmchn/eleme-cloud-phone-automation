# 饿了么商家版云手机ADB操作

通过ADB控制云手机操作饿了么商家版APP时，遇到操作限制问题。

## 测试结果

### ✅ 正常工作
- 连接设备
- 截图
- 部分点击（底部导航）
- 滑动
- 返回键

### ❌ 被限制的操作
- uiautomator dump（返回空结构）
- 右上角菜单点击
- 应用宝下载按钮

## 解决方案

### 已创建的脚本

| 文件 | 说明 |
|------|------|
| `eleme_controller.py` | 基础控制器 |
| `eleme_ocr_controller.py` | OCR识别版 |
| `eleme_sendevent_controller.py` | sendevent底层方案 |

## 解决方案说明

### 方案1：motionevent 点击
```bash
adb shell input motionevent DOWN X Y
adb shell input motionevent UP X Y
```

### 方案2：sendevent 底层事件
```bash
adb shell sendevent /dev/input/event0 3 53 X    # ABS_MT_POSITION_X
adb shell sendevent /dev/input/event0 3 54 Y    # ABS_MT_POSITION_Y
adb shell sendevent /dev/input/event0 1 330 1   # BTN_TOUCH_DOWN
adb shell sendevent /dev/input/event0 0 0 0     # SYN_REPORT
```

### 方案3：Accessibility Service（推荐）
编写Android无障碍服务APK，使用`AccessibilityNodeInfo.performAction()`执行点击，可以绕过APP检测。

### 方案4：OCR + 坐标点击
1. 截图
2. OCR识别文字位置
3. 计算坐标并点击

## 依赖安装

```bash
# OCR依赖
pip install pytesseract pillow

# Tesseract OCR
sudo apt install tesseract-ocr tesseract-ocr-chi-sim
```

## 使用方法

```bash
# 运行控制器
python3 eleme_controller.py
python3 eleme_ocr_controller.py
```

## 核心问题分析

某些按钮点击无效的原因：
1. **APP防自动化**：饿了么/应用宝内置检测机制
2. **敏感区域保护**：下载按钮、设置菜单等被保护
3. **云手机限制**：某些云手机的ADB实现有阉割

## 后续方案

1. **尝试Accessibility Service APK** - 需要开发Android应用
2. **使用官方API** - open.ele.me 需要企业资质
3. **OCR+人工确认** - 半自动方案
