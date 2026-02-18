# 饿了么商家版云手机自动化

## 方案架构

```
┌─────────────────┐      HTTP API       ┌─────────────────┐
│   AI 助手       │ ──────────────────▶ │  API 服务器     │
│ (OpenClaw)     │                     │ (eleme_api)     │
└─────────────────┘                     └────────┬────────┘
                                                 │
                                          ADB 命令
                                                 │
                                                 ▼
                                         ┌─────────────────┐
                                         │   云手机        │
                                         │ (多多云)        │
                                         └─────────────────┘
```

## 项目文件

| 文件 | 说明 |
|------|------|
| `eleme_api_server.py` | API服务器 - AI通过HTTP控制 |
| `eleme_ai_client.py` | AI客户端 - 封装API调用 |
| `eleme_autojs.js` | AutoJS脚本 - 无障碍服务自动化 |
| `AUTOJS_GUIDE.md` | AutoJS使用指南 |

## 快速开始

### 1. 启动API服务器

在连接云手机的电脑上运行：

```bash
python3 eleme_api_server.py
```

服务地址：`http://localhost:5000`

### 2. AI调用示例

```python
from eleme_ai_client import ElemeAI

client = ElemeAI()

# 截图
client.screenshot()

# 点击坐标 (540, 960)
client.click(540, 960)

# 滑动
client.swipe("up")

# 返回
client.back()
```

### 3. HTTP API调用

```
# 截图
curl http://localhost:5000/api/screenshot

# 点击
curl "http://localhost:5000/api/click?x=540&y=960"

# 滑动
curl "http://localhost:5000/api/swipe?direction=up&times=1"

# 状态
curl http://localhost:5000/api/status
```

## API接口清单

### 基础操作

| 接口 | 说明 | 示例 |
|------|------|------|
| `/api/connect` | 连接云手机 | - |
| `/api/screenshot` | 截图 | 返回base64图片 |
| `/api/click?x=&y=` | 点击坐标 | `/api/click?x=540&y=960` |
| `/api/swipe?direction=&times=` | 滑动 | `/api/swipe?direction=up&times=1` |
| `/api/back` | 返回 | - |
| `/api/home` | 主页 | - |
| `/api/text?text=` | 输入文字 | `/api/text?text=hello` |
| `/api/launch` | 启动APP | `/api/launch?package=me.ele.napos` |

### 状态查询

| 接口 | 说明 |
|------|------|
| `/api/status` | 设备状态、屏幕尺寸、当前APP |

## AI控制流程

```
AI收到用户指令
     │
     ▼
解析指令 (点击/滑动/截图)
     │
     ▼
调用HTTP API
     │
     ▼
API服务器执行ADB命令
     │
     ▼
云手机执行操作
     │
     ▼
返回结果给AI
     │
     ▼
AI返回文字/截图给用户
```

## AutoJS补充

对于需要无障碍服务的复杂操作（如批量调价），可以使用AutoJS脚本：

1. 在云手机上安装AutoJS
2. 导入`eleme_autojs.js`
3. 运行脚本

## 部署架构

```
另一台电脑(云手机)
       │
       │ 运行 eleme_api_server.py
       ▼
   HTTP API
       │
       │ AI调用
       ▼
   OpenClaw (你的AI助手)
```
