import multiprocessing
import os

bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

workers = multiprocessing.cpu_count() * 2 + 1

threads = 2

worker_class = "gthread"

timeout = 120

keepalive = 5

graceful_timeout = 30

max_requests = 1000

max_requests_jitter = 100

accesslog = "-"

errorlog = "-"

capture_output = True

loglevel = os.getenv("LOG_LEVEL", "info")

preload_app = False