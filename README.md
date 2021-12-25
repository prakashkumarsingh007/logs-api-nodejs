# Logs API
API for getting logs from large log files.

## Data

Sample Log file is being stored in the `logs` folder.

## Routes

- /api/logs?startDateTime="<start-date-ISO-string>"&endDateTime="<end-date-ISO-string>"
   - Querry Params : startDateTime, endDateTime
   - If startDateTIme is not provide it return logs for last five minutes.
   - If endDateTime is not provides the It return logs for five minutes from startDateTime.
   - Returns: Array of logs 
   - Limits - By default a max log return size of 10 MB is imposed.

## Run Server

After extracting from the zip file. Navigate inside the extracted folder and run following commands to start the server.

```sh
node app.js
```

After running the command above you should be able to see something like this:

```sh
server started on port: 80
```
Now the server is running on localhost port 80.

## Tech

Bellow are the node and npm versions used in the development.

```sh
node --version
v16.13.0
```
```sh
npm --version
8.1.0
```
