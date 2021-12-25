var fs = require("fs");

async function getStartTimeStamp(fd, position) {
    let buffer = Buffer.alloc(300);
    fs.readSync(fd, buffer, 0, buffer.length, position);
    let lastIndex = buffer.indexOf(0x00);
    buffer = buffer.slice(0, lastIndex);
    let firstLineBreak = buffer.toString().indexOf('\n');
    let lineString = buffer.slice(position, firstLineBreak).toString();
    return Date.parse(lineString.trim().split(' ')[0])
}

async function getTimeStamp(fd, position) {
    let newPosition = position-300>=0 ? position-300 : 0;
    let bufferSize = 300;
    if(position-300<0) bufferSize = position;
    let buffer = Buffer.alloc(bufferSize);
    fs.readSync(fd, buffer, 0, buffer.length, newPosition);
    let lastIndex = buffer.indexOf(0x00);
    buffer = buffer.slice(0, lastIndex);
    let lastLineBreak = buffer.toString().lastIndexOf('\n');
    let newBuffer = Buffer.alloc(300);
    fs.readSync(fd, newBuffer, 0, newBuffer.length, newPosition+lastLineBreak+1);
    lastIndex = newBuffer.indexOf(0x00);
    newBuffer = newBuffer.slice(0, lastIndex);
    let nextLineBreak = newBuffer.toString().indexOf('\n');
    let lineString = newBuffer.slice(0, nextLineBreak).toString();
    let lineTimeStamp = Date.parse(lineString.trim().split(' ')[0]);
    return [newPosition+lastLineBreak+1, lineTimeStamp];
}

async function searchLogFile(targetTimeStamp, filePath) {
    let fileStats = fs.statSync(filePath);
    let totalFileSize = fileStats?.size;
    let fd = fs.openSync(filePath);
    let start = 0;
    let end = totalFileSize - 1;
    let startTimeStamp = await getStartTimeStamp(fd, start);
    let endInfo = await getTimeStamp(fd, end);
    let endTimeStamp = endInfo[1];
    let resPosition = null;
    let resTimeStamp = null;
    if(targetTimeStamp > endTimeStamp) {
        fs.closeSync(fd);
        return [resPosition, resTimeStamp];
    } 
    if(targetTimeStamp <= startTimeStamp) {
        fs.closeSync(fd);
        return [0, startTimeStamp];
    }
    while(start <= end && startTimeStamp <= endTimeStamp) {
        let midInfo  = await getTimeStamp(fd, start + Math.floor((end-start)/2));
        let prevStart = start;
        let prevEnd = end;
        if(isNaN(start) || isNaN(end) || isNaN(midInfo[1]) || startTimeStamp==endTimeStamp)
            break; 
        if(targetTimeStamp > midInfo[1]) {
            start = midInfo[0];
            startTimeStamp = midInfo[1];
        } else if(targetTimeStamp <= midInfo[1]) {
            resPosition = midInfo[0];
            resTimeStamp = midInfo[1];
            end = midInfo[0]+25 < totalFileSize ? midInfo[0]+25 : midInfo[0]-1;
            let tempEndInfo = await getTimeStamp(fd, end);
            endTimeStamp = tempEndInfo[1];
        }
        if(prevStart==start && prevEnd==end) 
            break;
    }
    fs.closeSync(fd);
    return [resPosition, resTimeStamp]
}

async function extractLogs(filePath, searchInfo, endDatetime, maxLogSize) {
    let fd = fs.openSync(filePath);
    let logBuffer = Buffer.alloc(maxLogSize);
    fs.readSync(fd, logBuffer, 0, logBuffer.length, searchInfo[0]);
    logBuffer = logBuffer.slice(0,logBuffer.toString().lastIndexOf('\n'));
    let logArray = logBuffer.toString().split('\n');
    logArray = logArray.map((log) => {
        let logSplit = log.trim().split(' ');
        return [Date.parse(logSplit[0]), logSplit.join(' ')];
    });
    logArray = logArray.filter((log) => (log[0]>=searchInfo[1]&&log[0]<=endDatetime));
    logArray = logArray.map((log) => log[1]);
    fs.closeSync(fd);
    return logArray;
}

module.exports = { searchLogFile, extractLogs };