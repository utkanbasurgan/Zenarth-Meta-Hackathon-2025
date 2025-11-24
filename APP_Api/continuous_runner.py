#!/usr/bin/env python3
"""
Simple continuous runner that prints "Deneme" every 10 seconds.
"""
sss
import time

def continuous_runner():
    """Print 'Deneme' every 10 seconds."""
    print("Starting continuous runner...")
    print("Press Ctrl+C to stop")
    
    try:
        while True:
            print("Deneme")
            time.sleep(10)  # Wait 10 seconds
    except KeyboardInterrupt:
        print("\nStopping continuous runner...")

if __name__ == "__main__":
    continuous_runner()
