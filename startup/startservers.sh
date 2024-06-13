#!/bin/bash

# Start ping server 
echo "Starting ping server"
cd /var/web-apps/hallway-monitor-mainv2/ && /home/ubu/.nvm/versions/node/v18.19.0/bin/node ./servers/pingServer.js &

# Start monitor server
echo "Starting monitor server"
cd /var/web-apps/hallway-monitor-mainv2/ && /home/ubu/.nvm/versions/node/v18.19.0/bin/node ./servers/monitor.js &

# Start react server
echo "Starting react server"
cd /var/web-apps/hallway-monitor-mainv2/app/ && npm run dev 
