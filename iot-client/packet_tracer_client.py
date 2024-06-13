from realhttp import *
from time import *

serverIP = "192.95.44.36"
serverPort = 8000

client = RealWSClient()

# Set your desired name and MAC address here
name = "YourNameHere"
mac = "11:11:11:11"

def onWSConnectionChange(type):
    print("connection changed: " + str(type))

def onWSReceive(data):
    print("received from server: " + data)
    
    # Check if the message matches a command
    if data == 'sendinfo':
        client.send("info: mymac: {}, myname: {}".format(mac, "YourNameHere"))
    elif data.startswith("updatename:"):
        split_msg = data.split(":")
        updated_name = split_msg[1]
        # Assuming you have a write_name_to_config function
        # and a read_name_from_config function
        name = updated_name
        set_name = name

def on_open():
    # Send MAC and name information to the server
    client.send("mymac: {}, myname: {}".format(mac, name))

def set_name(new_name):
    global name
    name = new_name

def connect_to_server():
    uri = "ws://{}:{}".format(serverIP, serverPort)

    client.onConnectionChange(onWSConnectionChange)
    client.onReceive(onWSReceive)

    while True:
        try:
            # Establish a connection with the server
            client.connect(uri)

            on_open()

            # Keep the connection open indefinitely
            count = 0
            while True:
                try:
                    count += 1
                    if client.state() == 3:
                        client.send("hello {}".format(count))
                    sleep(1)
                except RealHTTPException as e:
                    print("RealHTTPException:", e)
                    break
        except (RealHTTPException, ConnectionRefusedError):
            print("Unable to connect. Retrying in 5 seconds...")
            sleep(5)

if __name__ == "__main__":
    connect_to_server()
