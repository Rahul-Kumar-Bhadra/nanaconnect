import requests
import time

def keep_alive():
    url = "https://nanaconnect-api.onrender.com/health"
    try:
        response = requests.get(url)
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Health check: {response.status_code}")
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Health check failed: {e}")

if __name__ == "__main__":
    keep_alive()
