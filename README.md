# Final-Project-2108502 setup:
(step 1) install tailscale from https://tailscale.com/download

(step 2) install nvm using ```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash``` from the offical NVM github repo https://github.com/nvm-sh/nvm

(step 3) generate a TLS certificate and key using the command tailscale cert [tailscale domain]

(step 3.5) open the file monitor.js and locate ```var options = {``` and replace the current paths for both the .key and .cert files to the directory of the files created in step 3

(step 4) install nginx using ```sudo apt install nginx``` and use the following config for the default config:
```
server {
    listen 443 ssl;
    server_name hallmonitor1.tail1e215.ts.net;

    ssl_certificate [replace with the full path of tailscale cert created in step 3];
    ssl_certificate_key [replace with the full path of tailscale key created in step 3];


    location / {
        proxy_pass http://localhost:3000; # Change the port if your app runs on a different port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        # try_files $uri /index.html; # This line is commented out since it's already handled by the React app
    }

    # Proxy requests to port 3001 for all API endpoints
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy requests to port 8000 for another API
    location /api2 {
        proxy_pass http://localhost:444;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

```
(step 5) restart nginx using "sudo systemctl restart nginx"

(step 6) open a new terminal otherwise NVM will NOT work, install node v18.16.0 using the command ```nvm install 18.16.0``` followed by ```nvm use 18.16.0```

(step 7) open the main directory containing the file ```package.json``` and run the command ```sudo npm install```

(step 8) replace both the domain and clientID variables in the index.js file with the correct values for your 0Auth application 

(step 9) create .env file at the root of application **note not all values are implomented due to compatibility issues**
```
# monitor.js variables:
audience = https://[replace with 0auth application domain]/api/v2/ #also used for app.js
issuerBaseURL = https://[replace with 0auth application domain]/
key = [replace with full path of tailscale cert key]
cert = [replace with full path of tailscale cert cert]
corsOrig = [replace with full tailscale url]  

# end of monitor.js variables

# start of ipMac.js variables
monitorGetmac=https://[replace with tailscale url]:444/api2/ipMacMap
monitorUpdateName="https://[replace with tailscale url]:444/api2/updatename/"
# end of ipMac.js variables

# start of app.js variables
domain = [replace with 0auth application domain]
clientId = [replace with 0auth application ClientID]
# end of app.js variables

```



to run servers use startservers.sh in ./startup **it must be ran under sudo due to using port 444**
command ```sudo ./startservers.sh```
