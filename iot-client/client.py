import asyncio
import websockets
import re
import uuid
import json

# File handling
CONFIG_FILE = r'./config.json'



def get_config_data():
    try:
        with open(CONFIG_FILE, "r") as file:
            config_data = json.load(file)
            return config_data
    except FileNotFoundError:
        print("Config file not found.")
        return {}
    except json.JSONDecodeError:
        print("Error decoding JSON in config file.")
        return {}


def write_name_to_config(name, device_properties):
    try:
        with open(CONFIG_FILE, "w") as file:
            config_data = {
                "name": name,
                "Device_prop": device_properties
                }
            print(device_properties)
            json.dump(config_data, file, indent=2)
    except Exception as e:
        print(f"Error writing to config file: {e}")


async def connect_to_server():
    uri = "wss://hallmonitor1.tail1e215.ts.net:444"
    mac = ':'.join(re.findall('..', '%012x' % uuid.getnode()))
    print(mac)

    config_data = get_config_data()
    name = config_data.get("name", "YourNameHere")

    # Provide default values for device properties
    device_properties = config_data.get("Device_prop", [])
    device_type = device_properties[0].get("type", "Type not specified") if device_properties else "Type not specified"
    Device_info_given = device_properties[0].get("info_given", "Type not specified") if device_properties else "Type not specified"

    while True:
        try:
            # Establish a connection with the server
            async with websockets.connect(uri) as websocket:
                print("Connected to the server")

                # Send MAC and name information to the server
                await websocket.send(f"mymac: {mac}, myname: {name}")

                # Keep the connection open indefinitely
                while True:
                    try:
                        # Receive messages from the server
                        message = await websocket.recv()
                        print(f"Received from server: {message}")

                        # Check if the message matches a command
                        if message == 'sendinfo':
                            await websocket.send(f"info: mymac: {mac}, myname: {name}")
                        elif message == 'device_prop':
                            await websocket.send(f"device_type: {device_type} Device_info_given: {Device_info_given}")
                            config_data = get_config_data()
                            device_properties = config_data.get("Device_prop", [])
                            device_type = device_properties[0].get("type", "Type not specified") if device_properties else "Type not specified"
                            Device_info_given = device_properties[0].get("info_given", "Type not specified") if device_properties else "Type not specified"
                            print(device_type)
                            print(Device_info_given)

                        elif message.startswith("updatename:"):
                            split_msg = message.split(":")
                            updated_name = split_msg[1]
                            write_name_to_config(updated_name, device_properties)
                            config_data = get_config_data()
                            name = config_data.get("name", "YourNameHere")

                    except websockets.ConnectionClosed:
                        print("Connection to server closed")
                        break
        except (websockets.WebSocketException, ConnectionRefusedError):
            print("Unable to connect. Retrying in 5 seconds...")
            await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(connect_to_server())
