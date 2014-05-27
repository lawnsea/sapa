# Sapa

Transform [Performance Timelines][Performance Timeline] into Chrome Devtools
Timelines.

## Installation

Sapa is available from npm.

``` shell
npm install sapa
```

## Quickstart

Sapa includes a `sapa` command that reads a JSON-encoded Performance Timeline
from `stdin` and writes a JSON-encoded Chrome Devtools Timeline to `stdout`.

``` shell
cat performance-timeline.json | node_modules/sapa/bin/sapa > chrome-timeline.json
```

For an example of using Sapa as a Node module, see `/bin/sapa`.

## API

Sapa exports a function from an array of objects implementing the
[`PerformanceEntry`][PerformanceEntry] interface to an array of objects
implementing the [`TimelineEvent`][protocol.json] interface.

```javascript
var chromeTimeline = require('sapa')(performanceTimeline);
```

## Development

### Running the tests

``` shell
npm test
```

## Release Notes

### 0.0.1

- emit [`mark`][PerformanceMark] and [`measure`][PerformanceMeasure] entries as
  `TimeStamp` records
- emit [`resource`][PerformanceResourceTiming] entries as `Resource*` records

## License

Sapa is made available under the [MIT License].

## Acknowledgements and Attribution

@pflannery's [chrome-timeline-logger] was a helpful reference, as were
[portions][protocol.json] [of][TimelineModel.js] the Blink source and the
[Chrome Devtools Timeline documentation].

[Performance Timeline]: http://www.w3.org/TR/performance-timeline
[PerformanceEntry]: http://www.w3.org/TR/performance-timeline/#performanceentry
[PerformanceMark]: http://www.w3.org/TR/user-timing/#performancemark
[PerformanceMeasure]: http://www.w3.org/TR/user-timing/#performancemeasure
[PerformanceResourceTiming]: http://www.w3.org/TR/resource-timing/#performanceresourcetiming
[MIT License]: http://opensource.org/licenses/mit-license.php
[chrome-timeline-logger]: https://github.com/pflannery/chrome-timeline-logger
[protocol.json]: https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/protocol.json
[TimelineModel.js]: https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/front_end/timeline/TimelineModel.js
[Chrome Devtools Timeline documentation]: https://developer.chrome.com/devtools/docs/timeline
