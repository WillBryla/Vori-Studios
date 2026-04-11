#!/usr/bin/env python3
"""
Screenshot utility using Playwright.
Usage:
  python screenshot.py <url>
  python screenshot.py <url> <label>

Examples:
  python screenshot.py http://localhost:3000
  python screenshot.py http://localhost:3000 hero
  python screenshot.py http://localhost:3000 full

Screenshots are saved to ./temporary screenshots/screenshot-N.png
or ./temporary screenshots/screenshot-N-label.png (auto-incremented, never overwritten).
"""

import sys
import os
import glob
from playwright.sync_api import sync_playwright

def next_screenshot_path(label=None):
    folder = os.path.join(os.path.dirname(__file__), "temporary screenshots")
    os.makedirs(folder, exist_ok=True)

    existing = glob.glob(os.path.join(folder, "screenshot-*.png"))
    nums = []
    for f in existing:
        name = os.path.basename(f)
        try:
            n = int(name.split("-")[1])
            nums.append(n)
        except (IndexError, ValueError):
            pass

    next_n = max(nums, default=0) + 1
    filename = f"screenshot-{next_n}-{label}.png" if label else f"screenshot-{next_n}.png"
    return os.path.join(folder, filename)


def take_screenshot(url, label=None, full_page=False):
    output_path = next_screenshot_path(label)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(url, wait_until="networkidle")
        page.screenshot(path=output_path, full_page=full_page)
        browser.close()

    print(output_path)
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    url = sys.argv[1]
    label = sys.argv[2] if len(sys.argv) > 2 else None
    full_page = label == "full" if label else False

    take_screenshot(url, label=label, full_page=full_page)
