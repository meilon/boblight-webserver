boblight-webserver
==================

boblight-webserver is a software designed to run on the same device running the boblightd server daemon, though it could connect to it via TCP/IP. You'll need the libboblight.so in rour library path and the following node.js addons:
* express
* socket.io
* ffi
* ref
* ref-array

Download the source, run npm install followed by a node server.js and you are good to go. Just open a browser on your desktop, tablet or phone and point it to http://127.0.0.1:8080/ and you can control your lights!