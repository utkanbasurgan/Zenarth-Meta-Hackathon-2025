#!/usr/bin/env python3
"""
Simple continuous runner.
This module keeps default values as top-level constants and lets callers override them.
"""

import time
from typing import Optional

# Top-level defaults (can be imported and overridden by other code)
DEFAULT_MESSAGE: str = "Deneme"
DEFAULT_INTERVAL: int = 10  # seconds


def continuous_runner(message: str = DEFAULT_MESSAGE, interval: int = DEFAULT_INTERVAL) -> None:
    """Print `message` every `interval` seconds until interrupted.

    Args:
        message: The text to print each interval.
        interval: Sleep time in seconds between prints.
    """
    print("Starting continuous runner...")
    print("Press Ctrl+C to stop")

    try:
        while True:
            print(message)
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nStopping continuous runner...")


if __name__ == "__main__":
    # simple CLI-like invocation using defaults; callers should import and call with params
    continuous_runner()
