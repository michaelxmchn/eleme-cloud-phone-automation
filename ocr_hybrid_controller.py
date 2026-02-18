#!/usr/bin/env python3
"""
OCR + Human Confirm Solution
Screenshot + OCR + Manual Confirm for Critical Steps
"""

import subprocess
import time
import os
from pathlib import Path

# Configuration
ADB_PATH = r"C:\Users\michael\adb\platform-tools\adb.exe"
DEVICE = "127.0.0.1:54513"


def run_cmd(cmd):
    """Execute command"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout, result.stderr, result.returncode


def screenshot(filename="ocr_screen.png"):
    """Take screenshot"""
    print(f"[SCREEN] Capture: {filename}")
    run_cmd(f'{ADB_PATH} -s {DEVICE} shell screencap -p /sdcard/{filename}')
    run_cmd(f'{ADB_PATH} -s {DEVICE} pull /sdcard/{filename} {filename}')
    return filename


def tap(x, y):
    """Click - using motionevent (verified effective)"""
    print(f"[TAP] Click: ({x}, {y})")
    run_cmd(f'{ADB_PATH} -s {DEVICE} shell input motionevent DOWN {x} {y}')
    time.sleep(0.1)
    run_cmd(f'{ADB_PATH} -s {DEVICE} shell input motionevent UP {x} {y}')
    time.sleep(0.5)
    return True


def swipe(x1, y1, x2, y2, duration=500):
    """Swipe"""
    print(f"[SWIPE] ({x1},{y1}) -> ({x2},{y2})")
    steps = 20
    for i in range(steps + 1):
        x = int(x1 + (x2 - x1) * i / steps)
        y = int(y1 + (y2 - y1) * i / steps)
        event = "MOVE" if i > 0 else "DOWN"
        run_cmd(f'{ADB_PATH} -s {DEVICE} shell input motionevent {event} {x} {y}')
        time.sleep(duration / steps / 1000)
    run_cmd(f'{ADB_PATH} -s {DEVICE} shell input motionevent UP {x2} {y2}')
    time.sleep(0.3)
    return True


def back():
    """Go back"""
    print(f"[BACK] Press back key")
    run_cmd(f'{ADB_PATH} -s {DEVICE} shell input keyevent 4')
    time.sleep(0.3)


def human_confirm(prompt):
    """Manual confirm"""
    print(f"\n{prompt}")
    print("Please confirm on cloud phone, then press Enter...")
    input()
    return True


def test_xiaohongshu():
    """Test Xiaohongshu download - OCR + Human Confirm"""
    
    print("=" * 60)
    print("[TEST] Xiaohongshu Download - OCR + Human Confirm")
    print("=" * 60)
    
    # Step 1: Screenshot
    print("\n[STEP1] Screenshot - current state")
    screenshot("step1_home.png")
    
    # Step 2: Find Xiaohongshu
    print("\n[STEP2] Find Xiaohongshu in screenshot")
    print("Please open 'step1_home.png' and find Xiaohongshu position")
    
    # Step 3: Tap on Xiaohongshu (search result position)
    print("\n[STEP3] Tap on Xiaohongshu")
    print("Position: (540, 300) - from search result")
    tap(540, 300)
    
    # Human confirm
    human_confirm("Did Xiaohongshu detail page open?")
    
    # Step 4: Screenshot detail page
    print("\n[STEP4] Screenshot - find download button")
    screenshot("step4_detail.png")
    print("Please check 'step4_detail.png' for download button position")
    
    # Step 5: Tap download button
    print("\n[STEP5] Tap download button")
    print("Using default position: (540, 1600)")
    tap(540, 1600)
    
    # Human confirm
    human_confirm("Did download start?")
    
    # Step 6: Check progress
    print("\n[STEP6] Check download progress")
    screenshot("step6_progress.png")
    
    print("\n" + "=" * 60)
    print("[DONE] Test completed")
    print("=" * 60)
    print("\nCheck these screenshots:")
    print("  - step1_home.png")
    print("  - step4_detail.png")
    print("  - step6_progress.png")


def test_direct_click():
    """Direct click test - use motionevent directly"""
    
    print("=" * 60)
    print("[TEST] Direct Click - MotionEvent")
    print("=" * 60)
    
    # Screenshot
    print("\n[SCREEN] Take screenshot...")
    screenshot("direct_test.png")
    
    # Try to download Xiaohongshu
    print("\n[TAP] Tap download button: (540, 1600)")
    tap(540, 1600)
    
    # Wait
    print("[WAIT] 3 seconds...")
    time.sleep(3)
    
    # Screenshot again
    print("\n[SCREEN] Take screenshot again...")
    screenshot("direct_result.png")
    
    print("\n" + "=" * 60)
    print("[DONE] Please check 'direct_result.png'")
    print("=" * 60)


def install_ocr():
    """Install OCR dependencies"""
    print("\n" + "=" * 60)
    print("[INSTALL] OCR Dependencies")
    print("=" * 60)
    print("\nRun these commands:")
    print("  pip install pytesseract pillow")
    print("\nInstall Tesseract OCR engine:")
    print("  Windows: https://github.com/UB-Mannheim/tesseract/wiki")
    print("  macOS: brew install tesseract")
    print("  Linux: sudo apt install tesseract-ocr")
    print("=" * 60)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        mode = sys.argv[1]
    else:
        print("Select mode:")
        print("  1 - OCR + Human Confirm (needs OCR lib)")
        print("  2 - Direct Click (motionevent)")
        print("  3 - Install OCR")
        print("\nEnter option (1/2/3): ", end="")
        mode = input() or "2"
    
    if mode == "1":
        test_xiaohongshu()
    elif mode == "2":
        test_direct_click()
    elif mode == "3":
        install_ocr()
    else:
        print("Invalid option")
