#!/usr/bin/env python3
"""
饿了么商家版云手机控制解决方案
解决AD B自动化被限制的问题
"""

import subprocess
import time
import os
import sys
import re
from pathlib import Path

# 配置
CLOUD_PHONE_HOST = "127.0.0.1"
CLOUD_PHONE_PORT = "52849"  # 从GitHub项目获取
DEVICE = f"{CLOUD_PHONE_HOST}:{CLOUD_PHONE_PORT}"
SCREENSHOT_PATH = "/sdcard/screen.png"
LOCAL_SCREENSHOT = "screenshot.png"
XML_PATH = "/sdcard/window_dump.xml"
LOCAL_XML = "window_dump.xml"


class ElemeController:
    def __init__(self, device=DEVICE):
        self.device = device
        self.screen_size = (1080, 1920)  # 默认尺寸
    
    def _run(self, cmd, timeout=30):
        """执行命令"""
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout, result.stderr, result.returncode
    
    def connect(self):
        """连接云手机"""
        print(f"🔌 连接云手机: {self.device}")
        stdout, stderr, code = self._run(f"adb connect {self.device}")
        print(f"   结果: {stdout.strip()}")
        return code == 0
    
    def screenshot(self, filename=LOCAL_SCREENSHOT):
        """截图"""
        print(f"📸 截图...")
        # 截图
        self._run(f"adb -s {self.device} shell screencap -p {SCREENSHOT_PATH}")
        # 拉取到本地
        self._run(f"adb -s {self.device} pull {SCREENSHOT_PATH} {filename}")
        return os.path.exists(filename)
    
    def get_screen_size(self):
        """获取屏幕尺寸"""
        stdout, _, _ = self._run(f"adb -s {self.device} shell wm size")
        if "x" in stdout:
            size = stdout.strip().split(" ")[-1]
            w, h = size.split("x")
            self.screen_size = (int(w), int(h))
            print(f"   屏幕尺寸: {w}x{h}")
        return self.screen_size
    
    def tap(self, x, y):
        """点击"""
        print(f"👆 点击: ({x}, {y})")
        
        # 方法1: 普通tap
        stdout1, _, _ = self._run(f"adb -s {self.device} shell input tap {x} {y}")
        
        # 方法2: motionevent (如果方法1失败)
        if "error" in stdout1.lower():
            print("   尝试motionevent...")
            self._run(f"adb -s {self.device} shell input motionevent DOWN {x} {y}")
            self._run(f"adb -s {self.device} shell input motionevent UP {x} {y}")
        
        time.sleep(0.5)
        return True
    
    def swipe(self, x1, y1, x2, y2, duration=500):
        """滑动 - 使用多种方法"""
        print(f"👆 滑动: ({x1},{y1}) -> ({x2},{y2})")
        
        # 方法1: 普通滑动
        stdout1, _, _ = self._run(
            f"adb -s {self.device} shell input swipe {x1} {y1} {x2} {y2} {duration}"
        )
        
        # 方法2: 如果方法1失败，尝试模拟motionevent
        if "error" in stdout1.lower() or not stdout1:
            print("   尝试motionevent序列...")
            steps = 10
            for i in range(steps):
                x = x1 + (x2 - x1) * i // steps
                y = y1 + (y2 - y1) * i // steps
                self._run(f"adb -s {self.device} shell input motionevent MOVE {x} {y}")
                time.sleep(duration // steps / 1000)
            self._run(f"adb -s {self.device} shell input motionevent UP {x2} {y2}")
        
        time.sleep(0.5)
        return True
    
    def input_text(self, text):
        """输入文字"""
        print(f"⌨️ 输入: {text}")
        # 替换特殊字符
        text = text.replace(" ", "%s")
        stdout, _, _ = self._run(f"adb -s {self.device} shell input text {text}")
        time.sleep(0.5)
        return True
    
    def press_key(self, keycode):
        """按键"""
        print(f"⌨️ 按键: {keycode}")
        self._run(f"adb -s {self.device} shell input keyevent {keycode}")
        time.sleep(0.3)
        return True
    
    def back(self):
        """返回"""
        return self.press_key("KEYCODE_BACK")
    
    def home(self):
        """主页"""
        return self.press_key("KEYCODE_HOME")
    
    def find_text_position(self, text, screenshot_path=LOCAL_SCREENSHOT):
        """使用OCR查找文字位置（需要截图后调用）"""
        # 这里需要OCR库，如pytesseract
        # 暂时返回中心位置
        w, h = self.screen_size
        return w // 2, h // 2


def test_basic():
    """基础测试"""
    controller = EleMeController()
    
    print("=" * 50)
    print("🧪 饿了么商家版控制测试")
    print("=" * 50)
    
    # 1. 连接
    print("\n1️⃣ 连接云手机...")
    controller.connect()
    
    # 2. 截图
    print("\n2️⃣ 截图测试...")
    if controller.screenshot():
        print("   ✅ 截图成功")
    
    # 3. 获取屏幕尺寸
    print("\n3️⃣ 获取屏幕尺寸...")
    controller.get_screen_size()
    
    # 4. 点击测试
    print("\n4️⃣ 点击测试...")
    w, h = controller.screen_size
    controller.tap(w // 2, h // 2)
    
    # 5. 滑动测试
    print("\n5️⃣ 滑动测试...")
    controller.swipe(w // 2, h - 200, w // 2, 200)
    
    # 6. 返回键
    print("\n6️⃣ 返回键...")
    controller.back()
    
    print("\n" + "=" * 50)
    print("✅ 测试完成！")
    print("=" * 50)


if __name__ == "__main__":
    test_basic()
