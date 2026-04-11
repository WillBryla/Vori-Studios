import http.server
import os
import sys

PORT = 3001
DIRECTORY = r"c:\Users\willi\OneDrive\Will Website V2"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass  # suppress logs

os.chdir(DIRECTORY)
with http.server.HTTPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}", flush=True)
    httpd.serve_forever()
