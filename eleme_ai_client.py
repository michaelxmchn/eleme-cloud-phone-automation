#!/usr/bin/env python3
"""
饿了么商家版 AI控制客户端
AI通过这个客户端控制云手机

使用方法:
    python3 eleme_ai_client.py
    
或导入使用:
    from eleme_ai_client import ElemeAI
    client = ElemeAI()
    client.click(540, 960)
"""

import requests
import base64
import json
import time

API_BASE = "http://localhost:5000"

class ElemeAI:
    """AI控制客户端"""
    
    def __init__(self, api_base=API_BASE):
        self.api_base = api_base
        self.last_screenshot = None
    
    def _call(self, endpoint, params=None):
        """调用API"""
        url = f"{self.api_base}{endpoint}"
        try:
            response = requests.get(url, params=params, timeout=30)
            return response.json()
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    # ==================== 基础操作 ====================
    
    def connect(self):
        """连接云手机"""
        return self._call("/api/connect")
    
    def screenshot(self):
        """截图"""
        result = self._call("/api/screenshot")
        if result.get("status") == "success":
            self.last_screenshot = result.get("image_base64")
        return result
    
    def click(self, x, y):
        """点击坐标"""
        return self._call("/api/click", {"x": x, "y": y})
    
    def swipe(self, direction="up", times=1):
        """滑动"""
        return self._call("/api/swipe", {"direction": direction, "times": times})
    
    def back(self):
        """返回"""
        return self._call("/api/back")
    
    def home(self):
        """主页"""
        return self._call("/api/home")
    
    def input_text(self, text):
        """输入文字"""
        return self._call("/api/text", {"text": text})
    
    def launch(self, package="me.ele.napos"):
        """启动APP"""
        return self._call("/api/launch", {"package": package})
    
    def status(self):
        """获取状态"""
        return self._call("/api/status")
    
    # ==================== 高级操作 ====================
    
    def click_text(self, text):
        """点击包含指定文字的元素（需要OCR配合）"""
        # 先截图
        self.screenshot()
        
        # 这里需要配合OCR来找到文字位置
        # 返回提示让AI知道需要OCR识别
        return {
            "status": "need_ocr",
            "message": f"需要OCR识别'{text}'的位置",
            "action": "click_text",
            "text": text
        }
    
    def scroll_and_click(self, text, max_scrolls=5):
        """滑动查找并点击"""
        for i in range(max_scrolls):
            # 截图并检查是否包含目标文字
            result = self.screenshot()
            
            # AI需要使用OCR识别
            # 这里返回提示
            print(f"滑动 {i+1}/{max_scrolls}...")
            self.swipe("up", 1)
            time.sleep(1)
        
        return {"status": "not_found", "message": f"未找到'{text}'"}
    
    # ==================== 快捷操作 ====================
    
    def open_eleme(self):
        """打开饿了么商家版"""
        print("📱 打开饿了么商家版...")
        self.launch("me.ele.napos")
        time.sleep(3)
        self.screenshot()
        return self.last_screenshot
    
    def go_to_tab(self, tab_name):
        """切换Tab（需要OCR配合点击）"""
        tab_map = {
            "首页": (540, 1850),
            "订单": (280, 1850),
            "商品": (810, 1850),
        }
        
        coords = tab_map.get(tab_name)
        if coords:
            return self.click(*coords)
        
        return {"status": "error", "message": f"未知Tab: {tab_name}"}


# ==================== AI指令解析 ====================

def parse_ai_command(command: str, client: ElemeAI = None):
    """
    解析AI的自然语言命令
    返回执行的API调用
    """
    if client is None:
        client = ElemeAI()
    
    command = command.lower()
    
    # 截图
    if "截图" in command or "截屏" in command or "screenshot" in command:
        return client.screenshot()
    
    # 点击
    if "点击" in command:
        # 尝试提取坐标
        import re
        coords = re.findall(r'(\d+)', command)
        if len(coords) >= 2:
            x, y = int(coords[0]), int(coords[1])
            return client.click(x, y)
        return {"status": "need_coords", "message": "请提供点击坐标"}
    
    # 滑动
    if "滑" in command:
        direction = "up"
        if "下" in command:
            direction = "down"
        elif "左" in command:
            direction = "left"
        elif "右" in command:
            direction = "right"
        return client.swipe(direction)
    
    # 返回
    if "返回" in command or "back" in command:
        return client.back()
    
    # 主页
    if "主页" in command or "home" in command:
        return client.home()
    
    # 打开APP
    if "打开" in command or "启动" in command:
        if "饿了么" in command:
            return client.open_eleme()
    
    # 状态
    if "状态" in command:
        return client.status()
    
    return {"status": "unknown", "message": f"未知命令: {command}"}


# ==================== 测试 ====================

def test():
    """测试"""
    client = ElemeAI()
    
    print("=" * 50)
    print("🧪 测试AI客户端")
    print("=" * 50)
    
    # 1. 连接
    print("\n1️⃣ 连接设备...")
    print(client.connect())
    
    # 2. 状态
    print("\n2️⃣ 设备状态...")
    print(client.status())
    
    # 3. 截图
    print("\n3️⃣ 截图...")
    result = client.screenshot()
    print(f"状态: {result.get('status')}")
    if result.get("image_base64"):
        print(f"图片大小: {len(result.get('image_base64'))} bytes")
    
    # 4. 点击
    print("\n4️⃣ 点击测试...")
    print(client.click(540, 960))
    
    # 5. 滑动
    print("\n5️⃣ 滑动测试...")
    print(client.swipe("up"))
    
    print("\n" + "=" * 50)
    print("✅ 测试完成")
    print("=" * 50)


if __name__ == "__main__":
    test()
