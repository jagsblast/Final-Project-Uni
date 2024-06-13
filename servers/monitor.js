const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const https = require('https');
const express = require('express');
const app = express();
const { auth } = require('express-oauth2-jwt-bearer');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const bodyParser = require('body-parser');
const { requiredScopes } = require('express-oauth2-jwt-bearer');
require('dotenv').config({ path: '/var/web-apps/hallway-monitor-mainv2/.env' });

const PORT_WS = 444;
const PORT_API = 3002;

const checkJwt = auth({
  audience: process.env.audience,
  issuerBaseURL: process.env.issuerBaseURL,
});

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var options = {
  key: fs.readFileSync(process.env.key),
  cert: fs.readFileSync(process.env.cert)
};

const corsOptions = {
  origin: process.env.corsOrig,
  allowedHeaders: 'Content-Type,Authorization',
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use((err, req, res, next) => {
  if (err.name === 'InvalidTokenError') {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    next(err);
  }
});

const ipMacMap = {};
const dev_info = {};
const clients = new Set();

app.get('/api2/ipMacMap', checkJwt, (req, res) => {
  res.status(200).json(ipMacMap)
});

app.get('/api2', checkJwt, (req, res) => {
  res.status(200).send("authorise");
});

app.post(`/api2/updatename/:ipAddress`, checkJwt, cors(corsOptions), (req, res) => {
  const ipAddress = req.params.ipAddress;
  const name = req.body.name;
  console.log(req.body.name)

  console.log('IP Address:', ipAddress);
  console.log('Name:', name);

  const msg = `updatename:${name}`;
  sendMsgtoClient(ipAddress, msg);

  res.status(200).send('Name updated successfully');
});

const serverAPI = https.createServer(options, app);
serverAPI.listen(PORT_API);

const wss = new WebSocket.Server({ noServer: true });

const allowedVpnIps = ['100.64.0.0/10', '127.0.0.1/23'];

const isAllowedIp = (ip) => {
  return allowedVpnIps.some((allowedIp) => {
    const [allowedNetwork, subnet] = allowedIp.split('/');
    const ipSections = ip.split('.');
    const allowedSections = allowedNetwork.split('.');

    return ipSections.slice(0, subnet / 8).join('.') === allowedSections.slice(0, subnet / 8).join('.');
  });
};

const pingInterval = setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.isAlive === false) {
      console.log(`Client ${client._socket.remoteAddress.replace('::ffff:', '')} is not responding. Terminating.`);
      return client.terminate();
    }

    client.isAlive = false;
    client.ping();
  });
}, 20000);

const serverWS = https.createServer(options);
serverWS.listen(PORT_WS);

serverWS.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws, req) => {
  console.log('Client connected');
  const ipAddr = req.connection.remoteAddress.replace('::ffff:', '');

  if (!isAllowedIp(ipAddr)) {
    console.log(`Unauthorized connection from ${ipAddr}. Closing connection.`);
    ws.terminate();
    return;
  }

  clients.add(ws);

  ws.send('send-info');

  ipMacMap[ipAddr] = {
    connected: 'true',
  };

  broadcast(`connected: ${ipAddr}`);

  const sendInfoInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('sendinfo');
      ws.send('device_prop')
    }
  }, 5000);

  ws.on('message', async (message) => {
    msg1 = `${message}`;
    console.log(msg1)
    if (msg1.slice(0, 5) === "info:") {
      match = msg1.match(/mymac: ([^,]+), myname: ([^]+)/);
      
      ipMacMap[ipAddr] = {
        mac: match[1],
        name: match[2],
        connected: true,
      };                              
    } else if (msg1.slice(0, 12) === "device_type:") {
      const pattern = /device_type:\s*([^,]+)\s*Device_info_given:\s*\[([^\]]+)\]/i;

      const match = msg1.match(pattern);

      if (match !== null) {
        const deviceType = match[1].trim();
        const deviceInfoGiven = match[2].split(',').map(item => item.trim());

        ipMacMap[ipAddr]["dev"] = {
          ipAddr,
          device_type: deviceType,
          Device_info_given: deviceInfoGiven
        };       

      } else {
        console.log("Pattern did not match.");
      }
    } else if (msg1 === 'close-connection') {
      console.log(`Client ${ipAddr} disconnected ungracefully.`);
      ws.terminate();
    }
  });

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    const isStillConnected = clients.has(ws);

    if (isStillConnected) {
      ipMacMap[ipAddr].connected = 'false';
      broadcast(`disconnected: ${ipAddr}`);
    }

    clients.delete(ws);
    clearInterval(sendInfoInterval);
  });
});

const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

function sendMsgtoClient(ip, message) {
  wss.clients.forEach((client) => {
    if (client._socket.remoteAddress.replace('::ffff:', '') === ip) {
      client.send(message);
      console.log(`Sent message to ${ip}: ${message}`);
    }
  });
}
