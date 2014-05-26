'use strict';

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

module.exports = function sapa(performanceTimeline) {
  var timeline = performanceTimeline.slice();

  return timeline.
    sort(function (a, b) {
      if (a.startTime !== b.startTime) {
        return a.startTime - b.startTime;
      } else {
        return a.duration - b.duration;
      }
    }).
    map(toTimeStamp);
};
