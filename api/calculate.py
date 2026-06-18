"""Vercel Serverless Function - 八字排盘 API + Frontend SPA"""
import json
import os
import mimetypes
from http.server import BaseHTTPRequestHandler

# Locate frontend dist directory
_DIST_DIR = None
for _candidate in [
    os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'),
    os.path.join(os.getcwd(), 'frontend', 'dist'),
]:
    if os.path.isdir(_candidate):
        _DIST_DIR = os.path.abspath(_candidate)
        break

# Preload index.html for SPA
_INDEX_HTML = None
if _DIST_DIR:
    _idx = os.path.join(_DIST_DIR, 'index.html')
    if os.path.isfile(_idx):
        with open(_idx, 'r', encoding='utf-8') as _f:
            _INDEX_HTML = _f.read()


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Serve frontend static files and SPA routes."""
        path = self.path.split('?')[0].lstrip('/')

        # Let Vercel handle its own internal paths (analytics, insights, etc.)
        if path.startswith('_vercel/'):
            self.send_response(404)
            self.end_headers()
            return

        # Try to serve a static file from dist
        if _DIST_DIR:
            file_path = os.path.join(_DIST_DIR, path) if path else None
            if file_path and os.path.isfile(file_path):
                with open(file_path, 'rb') as f:
                    content = f.read()
                ct = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
                self.send_response(200)
                self.send_header("Content-Type", ct)
                if path.startswith('assets/'):
                    self.send_header("Cache-Control", "public, max-age=31536000, immutable")
                self.end_headers()
                self.wfile.write(content)
                return

        # SPA fallback: serve index.html
        if _INDEX_HTML:
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(_INDEX_HTML.encode('utf-8'))
        else:
            self.send_response(503)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Frontend not built")

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        try:
            from bazi.models import BaziInput
            from bazi.engine import calculate_bazi

            data = json.loads(body)
            inp = BaziInput(**data)
            result = calculate_bazi(inp)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(
                json.dumps(result.model_dump(), ensure_ascii=False).encode("utf-8")
            )
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            self.send_response(500)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(
                json.dumps({"error": str(e), "traceback": tb}, ensure_ascii=False).encode("utf-8")
            )

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
