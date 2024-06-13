const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const { auth } = require('express-oauth2-jwt-bearer');

// const port = process.env.PORT || 8080;

const jwtCheck = auth({
  audience: 'https://192.95.44.36/api2/ipMacMap/',
  issuerBaseURL: 'https://dev-bp1s3e2ap7bopj75.uk.auth0.com/',
  tokenSigningAlg: 'RS256'
});
app.use(jwtCheck);

const ipMacMap = {}; // holds the ip, mac address, and name
const dev_info = {};
const clients = new Set();



const server = http.createServer(app);
