#!/usr/bin/env python3
import time
import subprocess
import os

def write_log(log_file, message):
    with open(log_file, 'a') as f:
        f.write(message)
        f.flush()
ss
ss
def run_api_script(log_file, api_dir):
    write_log(log_file, f"Running main_api.py at {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    try:
        result = subprocess.run(
            'source venv/bin/activate && python3 main_api.py "deneme"',
            shell=True,
            cwd=api_dir,
            executable='/bin/bash',
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.stdout:
            write_log(log_file, f"Output: {result.stdout}\n")
        
        if result.stderr:
            write_log(log_file, f"Error: {result.stderr}\n")
        
        write_log(log_file, f"Return code: {result.returncode}\n")
        
    except subprocess.TimeoutExpired:
        write_log(log_file, "Command timed out after 5 minutes\n")
        
    except Exception as e:
        write_log(log_file, f"Exception occurred: {str(e)}\n")


def continuous_runner():
    log_file = '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Backend/console.log'
    api_dir = '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Api'
    
    write_log(log_file, "Starting continuous runner...\n")
    write_log(log_file, "Press Ctrl+C to stop\n")
    
    try:
        while True:
            run_api_script(log_file, api_dir)
            time.sleep(10)
            
    except KeyboardInterrupt:
        write_log(log_file, "\nStopping continuous runner...\n")


if __name__ == "__main__":
    continuous_runner()
