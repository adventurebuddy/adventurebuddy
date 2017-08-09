
@echo "Killing servers..."
@taskkill /F /IM mongod.exe /T
@taskkill /F /IM node.exe /T
@taskkill /F /IM nginx.exe /T

@echo "Clearing logs..."
@del server\nginx\logs\*.log

@echo "Starting MongoDB..."
@start mongod

@sleep 5

@echo "starting NGINX..."
@start nginx -c server\nginx\conf\nginx.conf

@echo "Starting node server/node/server.js..."
@start node server\node\server.js >server\node\logs\adventurebuddy.log