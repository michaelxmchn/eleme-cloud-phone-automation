#!/usr/bin/env python3
"""
饿了么商家版 - OCR识别解决方案
通过截图+OCR识别文字位置，然后点击
"""

import subprocess
import time
import os
import sys
import json
from pathlib import Path

# 尝试导入OCR库
try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False
    print("⚠️ OCR库未安装，将使用坐标点击")

# 配置
CLOUD_PHONE_HOST = "127.0.0.1"
CLOUD_PHONE_PORT = "52849"
DEVICE = f"{CLOUD_PHONE_HOST}:{CLOUD_PHONE_PORT}"


class ElemeOCRController:
    def __init__(self, device=DEVICE):
        self.device = device
        self.screen_size = (1080, 1920)
        self.last_screenshot = "screenshot.png"
    
    def _run(self, cmd, timeout=30):
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout, result.stderr, result.returncode
    
    def connect(self):
        print(f"🔌 连接: {self.device}")
        stdout, _, _ = self._run(f"adb connect {self.device}")
        print(f"   {stdout.strip()}")
    
    def screenshot(self, filename=None):
        if filename:
            self.last_screenshot = filename
        print(f"📸 截图: {self.last_screenshot}")
        self._run(f"adb -s {self.device} shell screencap -p /sdcard/screen.png")
        self._run(f"adb -s {self.device} pull /sdcard/screen.png {self.last_screenshot}")
        return os.path.exists(self.last_screenshot)
    
    def get_screen_size(self):
        stdout, _, _ = self._run(f"adb -s {self.device} shell wm size")
        if "x" in stdout:
            size = stdout.strip().split(" ")[-1]
            w, h = size.split("x")
            self.screen_size = (int(w), int(h))
        return self.screen_size
    
    def find_text(self, text, exact=False):
        """OCR查找文字位置"""
        if not HAS_OCR:
            print("❌ 需要安装OCR库: pip install pytesseract pillow")
            return None
        
        if not os.path.exists(self.last_screenshot):
            self.screenshot()
        
        # 读取图片
        img = Image.open(self.last_screenshot)
        
        # OCR识别
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        
        # 查找匹配的文本
        matches = []
        n = len(data["text"])
        
        for i in range(n):
            txt = data["text"][i]
            if text in txt or (exact and txt == text):
                x = int(data["left"][i] + data["width"][i] / 2)
                y = int(data["top"][i] + data["height"][i] / 2)
                confidence = data["conf"][i]
                matches.append({
                    "text": txt,
                    "x": x,
                    "y": y,
                    "confidence": confidence
                })
        
        if matches:
            print(f"✅ 找到'{text}': {len(matches)}个位置")
            for m in matches:
                print(f"   - {m['text']}: ({m['x']}, {m['y']}) 置信度:{m['confidence']}")
            return matches[0]  # 返回第一个匹配
        
        print(f"❌ 未找到'{text}'")
        return None
    
    def tap_text(self, text):
        """点击文字（通过OCR定位）"""
        pos = self.find_text(text)
        if pos:
            return self.tap(pos["x"], pos["y"])
        return False
    
    def tap(self, x, y):
        """点击"""
        print(f"👆 点击: ({x}, {y})")
        
        # 方法1: input tap
        self._run(f"adb -s {self.device} shell input tap {x} {y}")
        
        # 方法2: motionevent序列（更可靠）
        time.sleep(0.1)
        self._run(f"adb -s {self.device} shell input motionevent DOWN {x} {y}")
        time.sleep(0.05)
        self._run(f"adb -s {self.device} shell input motionevent UP {x} {y}")
        
        time.sleep(0.3)
        return True
    
    def swipe(self, x1, y1, x2, y2, duration=500):
        """滑动"""
        print(f"👆 滑动: ({x1},{y1}) -> ({x2},{y2})")
        
        # 分步滑动
        steps = 20
        for i in range(steps + 1):
            x = int(x1 + (x2 - x1) * i / steps)
            y = int(y1 + (y2 - y1) * i / steps)
            self._run(f"adb -s {self.device} shell input motionevent {'MOVE' if i > 0 else 'DOWN'} {x} {y}")
            time.sleep(duration / steps / 1000)
        
        self._run(f"adb -s {self.device} shell input motionevent UP {x2} {y2}")
        time.sleep(0.3)
        return True
    
    def input_text(self, text):
        """输入文字"""
        print(f"⌨️ 输入: {text}")
        text = text.replace(" ", "%s")
        self._run(f"adb -s {self.device} shell input text {text}")
        time.sleep(0.3)
    
    def back(self):
        self._run(f"adb -s {self.device} shell input keyevent 4")
        time.sleep(0.3)


def install_ocr():
    """安装OCR依赖"""
    print("安装OCR依赖...")
    os.system("pip install pytesseract pillow -q")
    print("✅ 安装完成")


if __name__ == "__main__":
    if not HAS_OCR:
        print("⚠️ OCR未安装，要安装吗？(y/n)")
        # install_ocr()
    
    controller = ElemeOCRController()
    controller.connect()
    controller.get_screen_size()
    
    # 测试截图
    controller.screenshot()
    
    # 如果安装了OCR，可以查找文字
    if HAS_OCR:
        # 示例: 查找"确认"按钮
        # controller.find_text("确认")
        pass
    
    print("\n✅ 初始化完成")
