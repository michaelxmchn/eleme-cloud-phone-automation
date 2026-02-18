# Accessibility Service 方案 - 长期解决方案

**文档创建**: 2026-02-18  
**作者**: AI Assistant  
**状态**: 建议方案

---

## 📋 概述

### 方案名称
Android Accessibility Service 无障碍服务方案

### 目标
彻底解决云手机 ADB 操作中的按钮点击受限问题

### 原理
利用 Android 系统的无障碍服务 API，直接访问 APP 的 UI 元素，绕过 APP 的点击检测机制

---

## 🛠️ 技术原理

### Accessibility Service 是什么？

Android 无障碍服务是一种辅助功能，旨在帮助残障用户使用设备。它可以：
- 读取屏幕上的所有 UI 元素
- 获取元素的位置、状态、内容
- 执行点击、滑动、输入等操作
- 监听系统事件

### 为什么能绕过检测？

| 方法 | 原理 | 效果 |
|------|------|------|
| ADB input tap | 模拟触摸事件 | ❌ 易被检测 |
| ADB motionevent | 模拟完整触摸序列 | ⚠️ 部分有效 |
| Accessibility API | 直接操作 UI 元素 | ✅ 完全绕过 |

**关键区别**：
- `input tap` → 系统层事件 → APP 可检测
- `AccessibilityNodeInfo.performAction()` → APP 内部操作 → APP 无法区分

---

## 📁 项目结构

```
AccessibilityService/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/elemeservice/
│   │   │   │   ├── ElemeAccessibilityService.java    # 核心服务
│   │   │   │   ├── UIAutomatorHelper.java           # UI操作助手
│   │   │   │   └── MainActivity.java                # 配置界面
│   │   │   ├── res/
│   │   │   │   ├── layout/activity_main.xml
│   │   │   │   └── xml/accessibility_service_config.xml
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

---

## 💻 核心代码

### 1. ElemeAccessibilityService.java

```java
package com.example.elemeservice;

import android.accessibilityservice.AccessibilityService;
import android.graphics.Rect;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.List;

public class ElemeAccessibilityService extends AccessibilityService {
    
    private static final String TAG = "ElemeService";
    
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // 获取当前窗口
        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        
        if (rootNode == null) {
            return;
        }
        
        // 查找包含特定文字的节点
        List<AccessibilityNodeInfo> downloadButtons = 
            rootNode.findAccessibilityNodeInfosByText("下载");
        
        // 点击找到的按钮
        for (AccessibilityNodeInfo button : downloadButtons) {
            if (button.isClickable() && button.isEnabled()) {
                Log.d(TAG, "Found download button, performing click");
                button.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                break;
            }
        }
        
        // 查找特定 ID 的按钮（更精确）
        List<AccessibilityNodeInfo> buttonsById = 
            rootNode.findAccessibilityNodeInfosByViewId(
                "com.smile.gifmaker:id/download_button"
            );
        
        for (AccessibilityNodeInfo btn : buttonsById) {
            Rect bounds = new Rect();
            btn.getBoundsInScreen(bounds);
            Log.d(TAG, "Button bounds: " + bounds.toString());
            
            if (btn.isClickable()) {
                btn.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            }
        }
    }
    
    @Override
    public void onInterrupt() {
        Log.d(TAG, "Service interrupted");
    }
    
    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        Log.d(TAG, "Accessibility Service connected");
    }
}
```

### 2. 配置文件

**accessibility_service_config.xml**:
```xml
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged|typeViewClicked"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagReportViewIds|flagIncludeNotImportantViews"
    android:canRetrieveWindowContent="true"
    android:description="@string/accessibility_description"
    android:notificationTimeout="100"
    android:settingsActivity="com.example.elemeservice.MainActivity" />
```

**AndroidManifest.xml**:
```xml
<service
    android:name=".ElemeAccessibilityService"
    android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
    android:exported="false">
    <intent-filter>
        <action android:name="android.accessibilityservice.AccessibilityService" />
    </intent-filter>
    <meta-data
        android:name="android.accessibilityservice"
        android:resource="@xml/accessibility_service_config" />
</service>
```

---

## 🔧 Python 桥接

### eleme_accessibility_controller.py

```python
#!/usr/bin/env python3
"""
Android Accessibility Service 控制器
通过ADB调用无障碍服务执行操作
"""

import subprocess
import time
import json
from typing import Optional, List, Dict

ADB_PATH = r"C:\Users\michael\adb\platform-tools\adb.exe"
DEVICE = "127.0.0.1:54513"


class AccessibilityController:
    """无障碍服务控制器"""
    
    def __init__(self, device=DEVICE):
        self.device = device
        self.last_result = None
    
    def _run(self, cmd: str) -> tuple:
        """执行命令"""
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=30
        )
        return result.stdout, result.stderr, result.returncode
    
    def check_service_status(self) -> bool:
        """检查服务是否运行"""
        stdout, _, _ = self._run(f'{ADB_PATH} -s {self.device} shell dumpsys accessibility')
        return "ElemeAccessibilityService" in stdout
    
    def find_element_by_text(self, text: str) -> List[Dict]:
        """通过文字查找元素"""
        cmd = (
            f'{ADB_PATH} -s {self.device} shell am broadcast '
            f'-a com.example.elemeservice.FIND_TEXT '
            f'--es text "{text}"'
        )
        stdout, _, _ = self._run(cmd)
        
        try:
            # 解析返回结果
            result = json.loads(stdout)
            return result.get("elements", [])
        except:
            return []
    
    def find_element_by_id(self, view_id: str) -> List[Dict]:
        """通过View ID查找元素"""
        cmd = (
            f'{ADB_PATH} -s {self.device} shell am broadcast '
            f'-a com.example.elemeservice.FIND_ID '
            f'--es view_id "{view_id}"'
        )
        stdout, _, _ = self._run(cmd)
        
        try:
            result = json.loads(stdout)
            return result.get("elements", [])
        except:
            return []
    
    def click_element(self, element_id: str) -> bool:
        """点击元素"""
        cmd = (
            f'{ADB_PATH} -s {self.device} shell am broadcast '
            f'-a com.example.elemeservice.CLICK '
            f'--es element_id "{element_id}"'
        )
        stdout, _, _ = self._run(cmd)
        return "success" in stdout.lower()
    
    def execute_action(self, action: str, **kwargs) -> Dict:
        """
        执行操作
        
        支持的操作:
        - click_by_text: 通过文字点击
        - click_by_id: 通过View ID点击
        - scroll: 滚动
        - swipe: 滑动
        """
        action_map = {
            "click_by_text": self._click_by_text,
            "click_by_id": self._click_by_id,
            "scroll": self._scroll,
            "swipe": self._swipe,
        }
        
        if action in action_map:
            return action_map[action](**kwargs)
        
        return {"success": False, "error": f"Unknown action: {action}"}
    
    def _click_by_text(self, text: str, **kwargs) -> Dict:
        elements = self.find_element_by_text(text)
        if elements:
            element_id = elements[0].get("id")
            success = self.click_element(element_id)
            return {"success": success, "elements": elements}
        return {"success": False, "error": f"Text not found: {text}"}
    
    def _click_by_id(self, view_id: str, **kwargs) -> Dict:
        elements = self.find_element_by_id(view_id)
        if elements:
            element_id = elements[0].get("id")
            success = self.click_element(element_id)
            return {"success": success, "elements": elements}
        return {"success": False, "error": f"View ID not found: {view_id}"}
    
    def _scroll(self, direction: str = "down", **kwargs) -> Dict:
        cmd = f'{ADB_PATH} -s {self.device} shell input scroll {"down" if direction == "down" else "up"}'
        self._run(cmd)
        return {"success": True}
    
    def _swipe(self, x1: int, y1: int, x2: int, y2: int, **kwargs) -> Dict:
        cmd = f'{ADB_PATH} -s {self.device} shell input swipe {x1} {y1} {x2} {y2}'
        self._run(cmd)
        return {"success": True}
```

---

## 📋 执行清单

### 准备阶段（1-2天）
- [ ] 安装 Android Studio
- [ ] 创建 Android 项目
- [ ] 配置 Gradle 环境
- [ ] 学习 Android 开发基础

### 开发阶段（1-2周）
- [ ] 编写 AccessibilityService 核心代码
- [ ] 实现 UI 元素查找功能
- [ ] 实现点击、滑动操作
- [ ] 创建配置界面（MainActivity）
- [ ] 编写单元测试
- [ ] 打包 APK

### 集成阶段（3-5天）
- [ ] 安装 APK 到云手机
- [ ] 在系统设置中启用无障碍服务
- [ ] 编写 Python 桥接代码
- [ ] 测试 ADB 与服务的通信
- [ ] 端到端测试

### 优化阶段（1周）
- [ ] 调试识别精度问题
- [ ] 优化响应速度
- [ ] 处理边界情况（页面未加载、元素隐藏等）
- [ ] 完善错误处理
- [ ] 编写使用文档

---

## ⏰ 时间预估

| 阶段 | 时间 | 难度 | 备注 |
|------|------|------|------|
| 准备 | 1-2天 | ⭐ | 环境搭建 |
| 开发核心服务 | 5-7天 | ⭐⭐⭐ | 主要工作量 |
| 集成测试 | 3-5天 | ⭐⭐ | 联调工作 |
| 优化 | 5-7天 | ⭐⭐ | 打磨阶段 |

**总计**: 约 3-4 周

---

## 💰 成本分析

### 开发成本
- **时间**: 约 60-80 小时
- **工具**: 免费（Android Studio）
- **学习成本**: 需要 Android 开发基础

### 部署成本
- **云手机**: 无额外成本（已有）
- **APK**: 免费分发

### 维护成本
- **Bug 修复**: 偶尔
- **更新适配**: 饿了么 APP 更新时可能需要调整

---

## ✅ 优势

1. **彻底绕过检测** - 使用官方 API，无法被检测为自动化操作
2. **高精度** - 直接操作 UI 元素，位置准确
3. **通用性强** - 适用于所有 Android APP
4. **功能完整** - 支持点击、滑动、输入、滚动等所有操作

## ❌ 劣势

1. **开发复杂** - 需要 Android 开发经验
2. **维护成本** - 需要适配不同 Android 版本
3. **部署繁琐** - 需要在每台设备上手动启用服务
4. **权限问题** - 需要用户手动开启无障碍服务

---

## 🔗 相关资源

- [Android Accessibility 官方文档](https://developer.android.com/reference/android/accessibilityservice)
- [AccessibilityNodeInfo API](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo)
- [无障碍服务开发教程](https://developer.android.com/guide/topics/ui/accessibility)

---

## 📝 版本历史

| 版本 | 日期 | 描述 |
|------|------|------|
| 1.0 | 2026-02-18 | 初稿 |

---

**文档作者**: AI Assistant  
**最后更新**: 2026-02-18
