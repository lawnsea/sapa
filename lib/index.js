'use strict';

function toResourceSendRequest(entry) {
  return {
    type: 'ResourceSendRequest',
    startTime: entry.startTime,
    endTime: entry.requestStart < entry.startTime ?
      entry.startTime : entry.requestStart,
    data: {
      url: entry.name
    }
  };
}

function toResourceReceiveResponse(entry) {
  return entry.responseStart < entry.startTime ? null : {
    type: 'ResourceReceiveResponse',
    startTime: entry.responseStart,
    endTime: entry.responseStart,
    data: {
      url: entry.name
    }
  };
}

function toResourceReceivedData(entry) {
  return entry.responseStart < entry.startTime ? null : {
    type: 'ResourceReceivedData',
    startTime: entry.responseStart,
    endTime: entry.responseEnd,
    data: {
      url: entry.name
    }
  };
}

function toResourceFinish(entry) {
  return {
    type: 'ResourceFinish',
    startTime: entry.responseEnd,
    endTime: entry.responseEnd,
    data: {
      url: entry.name
    }
  };
}

function toTimeStamp(entry) {
  return {
    type: 'TimeStamp',
    startTime: entry.startTime,
    endTime: entry.startTime + entry.duration,
    data: {
      message: entry.entryType + ': ' + entry.name
    }
  };
}

function toRecord(entry) {
  switch (entry.entryType) {
    case 'resource':
      // Fields other than startTime and responseEnd can be 0 for x-origin
      // requests. In that case, the record factories return null, so elide
      // those values before returning.
      return [
        toResourceSendRequest(entry),
        toResourceReceiveResponse(entry),
        toResourceReceivedData(entry),
        toResourceFinish(entry)
      ].filter(function (record) {
        return !!record;
      });

    case 'mark':
    case 'measure':
      return [toTimeStamp(entry)];

    default:
      return [toTimeStamp(entry)];
  }
}

module.exports = function sapa(performanceTimeline) {
  var timeline = performanceTimeline.slice();
  var result = [];

  timeline.forEach(function (entry) {
      result.push.apply(result, toRecord(entry));
    });

  result.sort(function (a, b) {
      if (a.startTime !== b.startTime) {
        return a.startTime - b.startTime;
      } else {
        return a.endTime - b.endTime;
      }
    });

  return result;
};
