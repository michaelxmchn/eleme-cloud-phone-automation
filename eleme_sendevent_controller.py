#!/usr/bin/env python3
"""
饿了么商家版 - sendevent 解决方案
使用更底层的 sendevent 命令，绕过APP层检测
"""

import subprocess
import time
import os
import sys

# 配置
DEVICE = "127.0.0.1:52849"


class SendEventController:
    def __init__(self, device=DEVICE):
        self.device = device
        self.screen_size = (1080, 1920)
        self.touch_device = "/dev/input/event0"  # 可能需要调整
    
    def _run(self, cmd, timeout=30):
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout, result.stderr, result.returncode
    
    def get_touch_device(self):
        """获取触摸设备"""
        stdout, _, _ = self._run(f"adb -s {self.device} shell ls /dev/input/")
        print(f"   输入设备: {stdout.strip()}")
        return "event0"
    
    def get_screen_size(self):
        stdout, _, _ = self._run(f"adb -s {self.device} shell wm size")
        if "x" in stdout:
            size = stdout.strip().split(" ")[-1]
            w, h = size.split("x")
            self.screen_size = (int(w), int(h))
        return self.screen_size
    
    def sendevent_tap(self, x, y):
        """使用 sendevent 发送点击事件"""
        print(f"[SEND] sendevent tap: ({x}, {y})")
        
        # 将坐标转换为事件
        # 这是更底层的触摸事件发送方式
        x_hex = hex(x)
        y_hex = hex(y)
        
        cmds = [
            # DOWN事件
            f"adb -s {self.device} shell sendevent {self.touch_device} 3 53 {x}",
            f"adb -s {self.device} shell sendevent {self.touch_device} 3 54 {y}",
            f"adb -s {self.device} shell sendevent {self.touch_device} 1 330 1",  # BTN_TOUCH_DOWN
            f"adb -s {self.device} shell sendevent {self.touch_device} 0 0 0",    # SYN_REPORT
            # 等待
            f"adb -s {self.device} shell sleep 0.05",
            # UP事件
            f"adb -s {self.device} shell sendevent {self.touch_device} 1 330 0",  # BTN_TOUCH_UP
            f"adb -s {self.device} shell sendevent {self.touch_device} 0 0 0",    # SYN_REPORT
        ]
        
        for cmd in cmds:
            self._run(cmd)
        
        time.sleep(0.3)
        return True
    
    def tap(self, x, y):
        """综合点击：尝试多种方法"""
        print(f"[TAP] Click: ({x}, {y})")
        
        # 方法1: input tap (基础)
        self._run(f"adb -s {self.device} shell input tap {x} {y}")
        time.sleep(0.3)
        
        # 方法2: input motionevent
        self._run(f"adb -s {self.device} shell input motionevent DOWN {x} {y}")
        time.sleep(0.05)
        self._run(f"adb -s {self.device} shell input motionevent UP {x} {y}")
        time.sleep(0.3)
        
        # 方法3: sendevent (底层)
        # self.sendevent_tap(x, y)
        
        return True
    
    def swipe(self, x1, y1, x2, y2, duration=500):
        """滑动"""
        print(f"[SWIPE] ({x1},{y1}) -> ({x2},{y2})")
        
        # 分步滑动
        steps = duration // 20  # 每步20ms
        for i in range(steps + 1):
            x = int(x1 + (x2 - x1) * i / steps)
            y = int(y1 + (y2 - y1) * i / steps)
            
            if i == 0:
                # DOWN
                self._run(f"adb -s {self.device} shell input motionevent DOWN {x} {y}")
            elif i == steps:
                # UP
                self._run(f"adb -s {self.device} shell input motionevent UP {x} {y}")
            else:
                # MOVE
                self._run(f"adb -s {self.device} shell input motionevent MOVE {x} {y}")
            
            time.sleep(20 / 1000)  # 20ms
        
        time.sleep(0.3)
        return True
    
    def screenshot(self, filename="screen.png"):
        """截图"""
        print(f"[SCREEN] Screenshot...")
        self._run(f"adb -s {self.device} shell screencap -p /sdcard/{filename}")
        self._run(f"adb -s {self.device} pull /sdcard/{filename} {filename}")
        return os.path.exists(filename)
    
    def back(self):
        self._run(f"adb -s {self.device} shell input keyevent 4")
        time.sleep(0.3)


def test():
    """测试"""
    controller = SendEventController()
    
    print("=" * 50)
    print("TEST: sendevent solution")
    print("=" * 50)
    
    controller.get_screen_size()
    print(f"   Screen: {controller.screen_size}")
    
    # 测试点击
    print("\n1. Tap test...")
    w, h = controller.screen_size
    controller.tap(w // 2, h // 2)
    
    # 测试滑动
    print("\n2. Swipe test...")
    controller.swipe(w // 2, h - 200, w // 2, 200)
    
    # 测试截图
    print("\n3. Screenshot test...")
    controller.screenshot()
    
    print("\n" + "=" * 50)
    print("TEST: Completed")
    print("=" * 50)


if __name__ == "__main__":
    test()
