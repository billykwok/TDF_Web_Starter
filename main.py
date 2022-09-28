from asyncio.exceptions import CancelledError
from asyncio.tasks import ALL_COMPLETED
import logging
import asyncio
import os
from typing import List

import picamera
from starlette.websockets import WebSocket
from uvicorn import Config, Server
from starlette.applications import Starlette
from starlette.endpoints import WebSocketEndpoint
from starlette.middleware import Middleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.routing import Mount, WebSocketRoute
from starlette.staticfiles import StaticFiles
from uvicorn.config import LOGGING_CONFIG
from google.cloud import vision
import pygame 
from gtts import gTTS

os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=""

LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
logging.basicConfig(format=LOG_FORMAT, level=logging.INFO)
LOGGING_CONFIG["formatters"]["default"]["fmt"] = LOG_FORMAT
LOGGING_CONFIG["formatters"]["access"][
    "fmt"
] = "%(asctime)s | %(levelname)s | %(name)s | %(client_addr)s | %(request_line)s | %(status_code)s"
LOGGING_CONFIG["loggers"]["uvicorn.error"]["handlers"] = ["default"]
LOGGING_CONFIG["loggers"]["uvicorn.error"]["propagate"] = False
logger = logging.getLogger("main")

websockets: List[WebSocket] = []
camera = picamera.PiCamera()
vision_client = vision.ImageAnnotatorClient()

async def broadcast(*args, **kwargs):
    value = args[0]
    if len(websockets) > 0:
        logger.info("Sending: " + value)
        await asyncio.wait(
            [asyncio.create_task(ws.send_text(value)) for ws in websockets],
            timeout=3,
            return_when=ALL_COMPLETED,
        )

async def poll_camera():
    while True:
        camera.start_preview() 
        await asyncio.sleep(.5)
        camera.capture('image.jpg')
        camera.stop_preview()

        with open('image.jpg', 'rb') as image_file:
            content = image_file.read()
            response = vision_client.label_detection(image=vision.Image(content=content))
            labels = response.label_annotations
            for label in labels:
                await broadcast("Tags: {}".format(label.description))

        await asyncio.sleep(1)

class DataEndpoint(WebSocketEndpoint):
    async def on_connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        websockets.append(websocket)
        logger.info("Connected to %s", websocket)

    async def on_disconnect(self, websocket: WebSocket, close_code: int) -> None:
        websockets.remove(websocket)
        logger.warning(
            "Disconnected from websocket %s with code %s", websocket, close_code
        )
        await websocket.close()

    async def on_receive(self, websocket: WebSocket, data: str) -> None:
        logger.info("Socket: %s, Message: %s", websocket, data)
        if data is not None:
            t2s = gTTS(data, lang ='en')
            t2s.save('speech.mp3')
            pygame.mixer.init()
            pygame.mixer.music.load('speech.mp3')
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy(): 
                pygame.time.Clock().tick(10)

app = Starlette(
    routes=[
        WebSocketRoute("/ws", endpoint=DataEndpoint),
        Mount("/", app=StaticFiles(directory="static", html=True), name="static"),
    ],
    middleware=[Middleware(GZipMiddleware, minimum_size=1000)],
)

server = Server(
    config=Config(
        host="localhost",
        port=21489,
        app=app,
    )
)

async def event_loop():
    await asyncio.gather(
        asyncio.create_task(server.serve()),
        asyncio.create_task(poll_camera())
    )

def main():
    try:
        asyncio.run(event_loop())
    except CancelledError as er:
        pass

if __name__ == "__main__":
    main()
