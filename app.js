const http = require("http");
const url = require("url");

const Log = require("./controllers/logController");

const PORT = 80;

const server = http.createServer(async (req, res) => {
    // /api/logs?startDateTime=2020-01-03T22:00:00.000Z&endDateTime=2020-01-04 : GET
    if (req.url.match(/\/api\/logs\??(?:&?[^=&]*=[^=&]*)*/) && req.method === "GET") {
        try {
            // get querry object from url(contains start datetime and end datetime)
            const queryObject = url.parse(req.url, true).query;
            // get logs
            const logs = await new Log().getLogs(queryObject);
            // set the status code and content-type
            res.writeHead(200, { "Content-Type": "application/json" });
            // send the data
            res.end(JSON.stringify(logs));
        } catch (error) {
            // set the status code and content-type
            res.writeHead(404, { "Content-Type": "application/json" });
            // send the error
            res.end(JSON.stringify({ message: error }));
        }
    }

    // No route present
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});

server.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
});