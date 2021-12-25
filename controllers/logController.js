const { searchLogFile, extractLogs } = require("../utils/logUtil");

class LogController {
    // getting logs between a start datetime and end datetime
    async getLogs(logConfig) {
        const filePath = "logs/sample_log.txt";
        // max size(in bytes) of logs to be returned to user. 10 MB by default
        const maxLogSize = 10000000; 
        // if start datetime is available then convert to timestamp(in milliseconds) or set the start timestamp for last five minutes(300,000 ms)
        const startDateTime = logConfig?.startDateTime ? Date.parse(logConfig?.startDateTime) : Date.now()-300000;
        // if start datetime is available then convert to timestamp(in milliseconds) or set the end timestamp for start timestamp + five minutes(300,000 ms)
        const endDateTime = logConfig?.endDateTime ? Date.parse(logConfig?.endDateTime) : startDateTime+300000;
        // search log file for timestamp greater then or equal to start timestamp value: [startPositionInFile, startTimeStampInFile]
        const startTimeSearchResults = await searchLogFile(startDateTime, filePath);
        // initialize empty log array to be returned to user
        let logs = [];
        // extract logs for specified period from log file
        if(startTimeSearchResults[0] && startTimeSearchResults[1]) 
            logs = await extractLogs(filePath, startTimeSearchResults, endDateTime, maxLogSize);
        return logs;
    }
}

module.exports = LogController;