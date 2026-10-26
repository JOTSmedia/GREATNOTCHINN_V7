#!/usr/bin/env python3
"""Open this saved website using a local web address, as required by video embeds."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser

root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server:
    url = 'http://127.0.0.1:{}/'.format(server.server_port)
    print('Great Notch Inn preview: ' + url)
    print('Keep this window open while previewing. Press Control-C to stop.')
    Timer(0.3, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nPreview closed.')
