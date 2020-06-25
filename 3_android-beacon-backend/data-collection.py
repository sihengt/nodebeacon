import eventlet
import socketio
import csv
import pandas as pd
import numpy as np


sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

BEACON_MAC = 'DC:15:81:BC:0B:5D'
BEACON_MAC_STRING = "".join(BEACON_MAC.split(':')) 
filePath = input("Enter filepath please: ")
distance = input("Enter distance you are calibrating for: ")

filePath += BEACON_MAC_STRING + "-" + distance + ".csv"

def save_data(data):
    with open(filePath, mode='a') as beacon_csv:
        beacon_writer = csv.writer(beacon_csv, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        beacon_writer.writerow([data['rssi']])

@sio.event
def connect(sid, environ):
    print('connect ', sid)

@sio.event
def my_message(sid, data):
    print('message ', data)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

@sio.on('new message')
def another_event(sid, data):
    if data['mac'] == 'DC:15:81:BC:0B:5D':
        save_data(data)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 3319)), app)