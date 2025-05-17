#!/bin/bash
echo "Running local Resume Builder with SQLite..."
export PYTHONUNBUFFERED=1
export PYTHONDEVMODE=1
# Fix for the socket issue in Python 3.13
export FLASK_RUN_EXTRA_FILES=.
python local_main.py
