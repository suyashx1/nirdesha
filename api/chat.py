#!/usr/bin/env python3
"""
Direct handler for /api/chat
Routes to Nirdesha AI Serverless handler
"""
import sys
import os

_dir = os.path.dirname(os.path.abspath(__file__))
if _dir not in sys.path:
    sys.path.insert(0, _dir)
_parent = os.path.dirname(_dir)
if _parent not in sys.path:
    sys.path.insert(0, _parent)

try:
    from index import handler
except ImportError:
    from api.index import handler

