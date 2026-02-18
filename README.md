# 浜戞墜鏈?ADB 鎿嶄綔楗夸簡涔堝晢瀹剁増 APP 鍙楅檺

## 闂鎻忚堪

閫氳繃 ADB 鎺у埗浜戞墜鏈烘搷浣滈タ浜嗕箞鍟嗗鐗?APP (me.ele.napos) 鏃讹紝閬囧埌鎿嶄綔鍙楅檺闂銆?
## 鐜淇℃伅

- **浜戞墜鏈?IP**: 127.0.0.1:52849
- **鐩爣 APP**: 楗夸簡涔堝晢瀹剁増 (package: me.ele.napos)
- **ADB 璺緞**: C:\Users\michael\adb\platform-tools\adb.exe
- **鎿嶄綔绯荤粺**: Windows 11

## 闂璇︽儏

### 鉁?鎴愬姛鐨勬搷浣?
| 鎿嶄綔 | 鍛戒护 | 鐘舵€?|
|------|------|------|
| 杩炴帴璁惧 | `adb connect 127.0.0.1:52849` | 鉁?姝ｅ父 |
| 鎴浘 | `adb shell screencap -p /sdcard/screen.png` | 鉁?姝ｅ父 |
| 鑾峰彇璁惧鍒楄〃 | `adb devices` | 鉁?姝ｅ父 |
| 閮ㄥ垎鐐瑰嚮 | `adb shell input tap X Y` | 鉁?閮ㄥ垎鏈夋晥 |

### 鉂?澶辫触鐨勬搷浣?
| 鎿嶄綔 | 鍛戒护 | 閿欒淇℃伅 | 鐘舵€?|
|------|------|----------|------|
| 鑾峰彇 UI 鏍?| `adb shell uiautomator dump` | 杩斿洖绌虹粨鏋?| 鉂?鏃犳晥 |
| 婊戝姩鎿嶄綔 | `adb shell input swipe x1 y1 x2 y2` | 鏃犲弽搴?| 鉂?鏃犳晥 |
| 鏌愪簺鑿滃崟鐐瑰嚮 | `adb shell input tap X Y` | 鏃犲弽搴?| 鉂?鏃犳晥 |

## 閿欒鐜拌薄

### 1. uiautomator dump 杩斿洖绌虹粨鏋?
```bash
$ adb shell uiautomator dump
UI hierchary dumped to: /sdcard/window_dump.xml

$ adb pull /sdcard/window_dump.xml
<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>
<hierarchy rotation="0">
  <node index="0" text="" resource-id="" class="" package="me.ele.napos" 
        content-desc="" checkable="false" checked="false" clickable="false" 
        enabled="false" focusable="false" focused="false" scrollable="false" 
        long-clickable="false" password="false" selected="false" 
        bounds="[0,0][0,0]" />
</hierarchy>
```

### 2. 婊戝姩鎿嶄綔鏃犲搷搴?
```bash
$ adb shell input swipe 500 1800 500 500 500
# 鏃犻敊璇紝浣嗛〉闈㈡棤婊戝姩鍙嶅簲
```

### 3. 鏌愪簺鐐瑰嚮鏃犳晥

- 鐐瑰嚮搴曢儴瀵艰埅鏍忥紙棣栭〉銆佽鍗曘€佸晢鍝侊級鈫?鉁?鏈夋晥
- 鐐瑰嚮鍙充笂瑙掕彍鍗?鈫?鉂?鏃犲弽搴?- 鐐瑰嚮鏌愪簺鎸夐挳 鈫?鉂?鏃犲弽搴?
## 鎴浘璇佹嵁

[寰呮坊鍔犳埅鍥綸

## 鍙兘鍘熷洜鍒嗘瀽

### 鍘熷洜1锛氶タ浜嗕箞 APP 闃茶嚜鍔ㄥ寲鏈哄埗

**鍙兘鎬?*: 楂?
**鍒嗘瀽**:
- 楗夸簡涔堝晢瀹剁増鍙兘鍐呯疆浜嗘娴嬭嚜鍔ㄥ寲鑴氭湰鐨勬満鍒?- `uiautomator dump` 琚睆钄斤紝杩斿洖绌虹粨鏋?- 鏁忔劅鍖哄煙锛堣彍鍗曘€佽缃級鐨勭偣鍑昏鎷︽埅

**琛ㄧ幇**:
- 鎴浘鍔熻兘姝ｅ父锛堝簳灞傜郴缁熻皟鐢級
- 鍩虹鐐瑰嚮姝ｅ父锛堝簳灞?input 浜嬩欢锛?- UI 缁撴瀯鑾峰彇琚睆钄斤紙搴旂敤灞傞槻鎶わ級

### 鍘熷洜2锛氫簯鎵嬫満鏈嶅姟鍟?ADB 瀹炵幇闄愬埗

**鍙兘鎬?*: 涓?
**鍒嗘瀽**:
- 涓嶅悓浜戞墜鏈烘湇鍔″晢鐨?ADB 瀹炵幇鍙兘鏈夊樊寮?- 鏍囧噯 ADB 鍛戒护鍏煎鎬у彲鑳芥湁闂
- 鏌愪簺楂樼骇鍔熻兘鍙兘琚槈鍓?
**琛ㄧ幇**:
- 婊戝姩鎿嶄綔鍦ㄧ湡瀹炴墜鏈轰笂鏈夋晥锛屽湪浜戞墜鏈轰笂鏃犳晥
- uiautomator 鍦ㄦ煇浜涗簯鎵嬫満涓婁笉瀹屾暣

### 鍘熷洜3锛氱郴缁熺骇瑙︽懜浜嬩欢闄愬埗

**鍙兘鎬?*: 涓?
**鍒嗘瀽**:
- 浜戞墜鏈哄彲鑳藉 `input inject` 绫绘搷浣滄湁闄愬埗
- 闃叉鎭舵剰鑷姩鍖栬剼鏈?- 闇€瑕佺壒瀹氭潈闄愭墠鑳借Е鍙?
**琛ㄧ幇**:
- 鏌愪簺鐐瑰嚮鍖哄煙鏃犲搷搴?- 婊戝姩浜嬩欢琚郴缁熸嫤鎴?
## 瑙ｅ喅鏂规锛堝緟楠岃瘉锛?
### 鏂规1锛氫娇鐢?`adb shell input motionevent`

```bash
# 灏濊瘯浣跨敤鏇村簳灞傜殑杈撳叆浜嬩欢
adb shell input motionevent DOWN 100 500
adb shell input motionevent MOVE 100 400
adb shell input motionevent UP 100 400
```

### 鏂规2锛氫娇鐢ㄥ潗鏍囧亸绉?
```bash
# 灏濊瘯涓嶅悓鐨勫潗鏍囦綅缃?adb shell input tap 540 1200  # 涓績鍋忎笅
adb shell input tap 950 150   # 鍙充笂瑙?```

### 鏂规3锛氫娇鐢?Accessibility Service

闇€瑕佺紪鍐欎竴涓?Android 杈呭姪鏈嶅姟 APK锛岄€氳繃鏃犻殰纰嶆湇鍔℃搷浣滅晫闈€?
**浼樼偣**: 鍙互缁曡繃 APP 鐨勯槻鎶ゆ満鍒?**缂虹偣**: 闇€瑕佸紑鍙?APK锛屽鏉傚害楂?
### 鏂规4锛歄CR 璇嗗埆 + 浜哄伐杈呭姪

1. 瀹氭湡鎴浘
2. OCR 璇嗗埆鍏抽敭鏁版嵁
3. 浜哄伐纭鍏抽敭鎿嶄綔

**浼樼偣**: 100% 鍙潬
**缂虹偣**: 鏃犳硶鍏ㄨ嚜鍔?
### 鏂规5锛氫娇鐢ㄥ畼鏂?API

楗夸簡涔堝紑鏀惧钩鍙版彁渚?API 鎺ュ彛锛屽彲浠ョ洿鎺ヨ幏鍙栨暟鎹細

- `stats/order` - 璁㈠崟缁熻
- `stats/finance` - 璐㈠姟鏁版嵁
- `item/list` - 鍟嗗搧鍒楄〃

**浼樼偣**: 瀹樻柟鏀寔锛岀ǔ瀹氬彲闈?**缂虹偣**: 闇€瑕佷紒涓氳祫璐ㄧ敵璇?
## 鐩稿叧鏂囨。

- [楗夸簡涔堝紑鏀惧钩鍙癩(https://open.ele.me)
- [鎶€鏈鐩樿褰昡(../../鎶€鏈鐩?md)
- [API 鑳藉姏娓呭崟](../../ELEME_API_CAPABILITIES.md)

## ADB 鍛戒护閫熸煡

```bash
# 杩炴帴浜戞墜鏈?adb connect 127.0.0.1:52849

# 鏌ョ湅璁惧
adb devices

# 鎴浘
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png ./

# 鐐瑰嚮
adb shell input tap X Y

# 婊戝姩
adb shell input swipe x1 y1 x2 y2

# 杩斿洖閿?adb shell input keyevent BACK

# 鑾峰彇 UI 缁撴瀯锛堝彲鑳藉け璐ワ級
adb shell uiautomator dump
adb pull /sdcard/window_dump.xml
```

## 璐＄尞鎸囧崡

濡傛灉浣犳湁瑙ｅ喅鏂规锛屾杩庯細

1. 鎻?Issue 鎻忚堪瑙ｅ喅鏂规
2. 鎻愪氦 Pull Request
3. 鍒嗕韩绫讳技缁忛獙

## 璁稿彲璇?
MIT License
