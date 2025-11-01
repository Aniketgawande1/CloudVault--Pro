# utils/logger.py
import logging
import os

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(message)s")

def log_info(msg, **kwargs):
    logging.info(f"{msg} | {kwargs}")

def log_error(msg, **kwargs):
    logging.error(f"{msg} | {kwargs}")

def log_warn(msg, **kwargs):
    logging.warning(f"{msg} | {kwargs}")
