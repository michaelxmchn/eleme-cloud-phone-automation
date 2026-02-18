#!/usr/bin/env python3
"""
饿了么商家版自动化API服务
通过HTTP API控制云手机

使用方法:
    python3 eleme_api_server.py
    
然后可以通过以下API调用:
    http://localhost:5000/api/click?x=540&y=960
    http://localhost:5000/api/screenshot
    http://localhost:5000/api/swipe?direction=up
    http://localhost:5000/api/launch
    http://localhost:5000/api/set_promotion?amount=50
    http://localhost:5000/api/batch_adjust?percentage=10
    http://localhost:5000/api/modify_price?name=商品名称&price=28
"""

from flask import Flask, jsonify, request
import subprocess
import time
import os
import base64
import json
from datetime import datetime

app = Flask(__name__)

# ==================== 配置 ====================
# 云手机连接地址
CLOUD_PHONE_HOST = "127.0.0.1"
CLOUD_PHONE_PORT = "52849"
DEVICE = f"{CLOUD_PHONE_HOST}:{CLOUD_PHONE_PORT}"

SCREENSHOT_DIR = "./screenshots"

# 确保目录存在
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# ==================== ADB工具 ====================

def run_adb(command, timeout=30):
    """执行ADB命令"""
    result = subprocess.run(
        f"adb -s {DEVICE} {command}",
        shell=True, capture_output=True, text=True, timeout=timeout
    )
    return result.stdout, result.stderr, result.returncode

def connect_device():
    """连接云手机"""
    stdout, _, code = run_adb(f"connect {DEVICE}")
    return code == 0 or "already connected" in stdout.lower()

# ==================== 基础操作API ====================

@app.route('/api/connect', methods=['GET'])
def api_connect():
    """连接云手机"""
    success = connect_device()
    return jsonify({
        "status": "success" if success else "error",
        "message": "设备已连接" if success else "连接失败"
    })

@app.route('/api/screenshot', methods=['GET'])
def api_screenshot():
    """截图"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screen_{timestamp}.png"
    filepath = os.path.join(SCREENSHOT_DIR, filename)
    
    # 截图到手机
    run_adb('shell screencap -p /sdcard/screen.png')
    # 拉取到本地
    run_adb(f'pull /sdcard/screen.png {filepath}')
    
    # 转换为base64
    with open(filepath, 'rb') as f:
        img_base64 = base64.b64encode(f.read()).decode()
    
    return jsonify({
        "status": "success",
        "filename": filename,
        "image_base64": img_base64,
        "path": filepath
    })

@app.route('/api/click', methods=['GET'])
def api_click():
    """点击坐标"""
    x = request.args.get('x', type=int)
    y = request.args.get('y', type=int)
    
    if x is None or y is None:
        return jsonify({"status": "error", "message": "需要x和y参数"}), 400
    
    # 使用motionevent点击
    run_adb(f'shell input motionevent DOWN {x} {y}')
    time.sleep(0.05)
    run_adb(f'shell input motionevent UP {x} {y}')
    
    return jsonify({
        "status": "success",
        "action": "click",
        "x": x,
        "y": y
    })

@app.route('/api/swipe', methods=['GET'])
def api_swipe():
    """滑动屏幕"""
    direction = request.args.get('direction', 'up')
    times = request.args.get('times', 1, type=int)
    
    # 获取屏幕尺寸
    stdout, _, _ = run_adb('shell wm size')
    if 'x' in stdout:
        size = stdout.strip().split(' ')[-1]
        w, h = map(int, size.split('x'))
    else:
        w, h = 1080, 1920
    
    # 执行滑动
    for _ in range(times):
        if direction == 'up':
            run_adb(f'shell input swipe {w//2} {h*3//4} {w//2} {h*1//4} 400')
        elif direction == 'down':
            run_adb(f'shell input swipe {w//2} {h*1//4} {w//2} {h*3//4} 400')
        elif direction == 'left':
            run_adb(f'shell input swipe {w*3//4} {h//2} {w*1//4} {h//2} 400')
        elif direction == 'right':
            run_adb(f'shell input swipe {w*1//4} {h//2} {w*3//4} {h//2} 400')
        
        time.sleep(0.3)
    
    return jsonify({
        "status": "success",
        "action": "swipe",
        "direction": direction,
        "times": times
    })

@app.route('/api/back', methods=['GET'])
def api_back():
    """返回"""
    run_adb('shell input keyevent 4')
    return jsonify({"status": "success", "action": "back"})

@app.route('/api/home', methods=['GET'])
def api_home():
    """主页"""
    run_adb('shell input keyevent 3')
    return jsonify({"status": "success", "action": "home"})

@app.route('/api/text', methods=['GET'])
def api_input_text():
    """输入文字"""
    text = request.args.get('text', '')
    if not text:
        return jsonify({"status": "error", "message": "需要text参数"}), 400
    
    # 处理特殊字符
    text = text.replace(' ', '%s')
    run_adb(f'shell input text {text}')
    
    return jsonify({
        "status": "success",
        "action": "input_text",
        "text": text
    })

@app.route('/api/launch', methods=['GET'])
def api_launch():
    """启动APP"""
    package = request.args.get('package', 'me.ele.napos')
    run_adb(f'shell monkey -p {package} -c android.intent.category.LAUNCHER 1')
    time.sleep(2)
    
    return jsonify({
        "status": "success",
        "action": "launch",
        "package": package
    })

# ==================== 业务功能API ====================

@app.route('/api/set_promotion', methods=['GET'])
def api_set_promotion():
    """设置推广金额"""
    amount = request.args.get('amount', type=int)
    if not amount:
        return jsonify({"status": "error", "message": "需要amount参数"}), 400
    
    # 1. 启动APP
    api_launch()
    time.sleep(2)
    
    # 2. 截图确认在首页
    api_screenshot()
    
    # 3. 滑动查找推广入口
    run_adb(f'shell input swipe 540 1500 540 500 400')
    time.sleep(0.5)
    
    # 4. 这个需要配合AutoJS或更复杂的逻辑
    # 这里返回指导信息
    return jsonify({
        "status": "partial",
        "message": f"请在手机上手动设置推广金额{amount}元，或使用AutoJS脚本完整自动化",
        "action": "set_promotion",
        "amount": amount
    })

@app.route('/api/batch_adjust', methods=['GET'])
def api_batch_adjust():
    """批量调整价格"""
    percentage = request.args.get('percentage', type=int)
    if percentage is None:
        return jsonify({"status": "error", "message": "需要percentage参数"}), 400
    
    return jsonify({
        "status": "partial",
        "message": f"批量调价{percentage}%需要使用AutoJS脚本执行",
        "action": "batch_adjust",
        "percentage": percentage
    })

@app.route('/api/modify_price', methods=['GET'])
def api_modify_price():
    """修改单品价格"""
    name = request.args.get('name', '')
    price = request.args.get('price', type=float)
    
    if not name or not price:
        return jsonify({"status": "error", "message": "需要name和price参数"}), 400
    
    return jsonify({
        "status": "partial",
        "message": f"修改商品{name}为{price}元需要使用AutoJS脚本执行",
        "action": "modify_price",
        "name": name,
        "price": price
    })

# ==================== 状态查询 ====================

@app.route('/api/status', methods=['GET'])
def api_status():
    """获取设备状态"""
    stdout, _, code = run_adb('devices')
    
    # 屏幕尺寸
    size_stdout, _, _ = run_adb('shell wm size')
    screen_size = size_stdout.strip().split(' ')[-1] if 'x' in size_stdout else "未知"
    
    # 当前包名
    pkg_stdout, _, _ = run_adb('shell dumpsys window | grep mCurrentFocus')
    current_package = "未知"
    if 'me.ele.napos' in pkg_stdout:
        current_package = "me.ele.napos (饿了么商家版)"
    
    return jsonify({
        "device": DEVICE,
        "connected": code == 0,
        "screen_size": screen_size,
        "current_package": current_package,
        "adb_devices": stdout
    })

# ==================== 主页面 ====================

@app.route('/')
def index():
    return '''
    <html>
    <head>
        <title>饿了么商家版自动化API</title>
        <style>
            body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #ff6b00; }
            .api { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .method { color: #00aa00; font-weight: bold; }
            .desc { color: #666; }
        </style>
    </head>
    <body>
        <h1>🍜 饿了么商家版自动化API</h1>
        
        <h2>基础操作</h2>
        <div class="api">
            <span class="method">GET</span> /api/connect - 连接云手机<br>
            <span class="method">GET</span> /api/screenshot - 截图<br>
            <span class="method">GET</span> /api/click?x=540&y=960 - 点击坐标<br>
            <span class="method">GET</span> /api/swipe?direction=up&times=1 - 滑动<br>
            <span class="method">GET</span> /api/back - 返回<br>
            <span class="method">GET</span> /api/home - 主页<br>
            <span class="method">GET</span> /api/text?text=hello - 输入文字<br>
            <span class="method">GET</span> /api/launch - 启动APP<br>
        </div>
        
        <h2>状态查询</h2>
        <div class="api">
            <span class="method">GET</span> /api/status - 设备状态<br>
        </div>
        
        <h2>AI控制接口</h2>
        <p class="desc">AI可以通过调用这些接口控制手机执行操作</p>
    </body>
    </html>
    '''

if __name__ == '__main__':
    print("=" * 50)
    print("🍜 饿了么商家版自动化API服务")
    print("=" * 50)
    print(f"设备: {DEVICE}")
    print(f"服务地址: http://localhost:5000")
    print()
    print("API接口:")
    print("  /api/connect     - 连接云手机")
    print("  /api/screenshot  - 截图")
    print("  /api/click?x=540&y=960 - 点击")
    print("  /api/swipe?direction=up - 滑动")
    print("  /api/back        - 返回")
    print("  /api/home        - 主页")
    print("  /api/status      - 状态")
    print()
    print("启动服务...")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
