var sapa = require('../lib/index');

module.exports = {
  'given an empty array, returns an empty array': function (test) {
    test.deepEqual(sapa([]), [], 'given an empty array, return an empty array');
    test.done();
  },

  'does not mutate input array': function (test) {
    var input = [{
      name: 'foo',
      startTime: 0,
      duration: 123
    }];

    sapa(input);
    test.equal(input.length, 1, 'do not mutate input array');
    test.done();
  },

  'sorts all records by startTime and then by endTime': function (test) {
    var records = sapa([{
          name: 'foo',
          entryType: 'mark',
          startTime: 0,
          duration: 0
        }, {
          name: 'http://example.com/foo',
          entryType: 'resource',
          startTime: 1,
          requestStart: 2,
          responseStart: 3,
          responseEnd: 4,
          duration: 3,

          secureConnectionStart: 0,
          connectEnd: 1,
          connectStart: 1,
          domainLookupEnd: 1,
          domainLookupStart: 1,
          fetchStart: 1,
          redirectEnd: 0,
          redirectStart: 0,
          initiatorType: 'script'
        }, {
          name: 'bar',
          entryType: 'mark',
          startTime: 1,
          duration: 0
        }, {
          name: 'applesauce',
          entryType: 'mark',
          startTime: 2,
          duration: 0
        }, {
          name: 'chutney',
          entryType: 'measure',
          startTime: 3,
          duration: 2
        }]);

      test.strictEqual(records[0].data.message, 'mark: foo');
      test.strictEqual(records[1].data.message, 'mark: bar');
      test.strictEqual(records[2].type, 'ResourceSendRequest');
      test.strictEqual(records[3].data.message, 'mark: applesauce');
      test.strictEqual(records[4].type, 'ResourceReceiveResponse');
      test.strictEqual(records[5].type, 'ResourceReceivedData');
      test.strictEqual(records[6].data.message, 'measure: chutney');
      test.strictEqual(records[7].type, 'ResourceFinish');

      test.done();
  },

  'makes marks and measures TimeStamps with endTime === startTime + duration':
    function (test) {
      test.deepEqual(sapa([{
          name: 'foo',
          entryType: 'mark',
          startTime: 0,
          duration: 0
        }, {
          name: 'bar',
          entryType: 'measure',
          startTime: 0,
          duration: 2
        }, {
          name: 'applesauce',
          entryType: 'measure',
          startTime: 1,
          duration: 1
        }, {
          name: 'chutney',
          entryType: 'mark',
          startTime: 3,
          duration: 0
        }]), [{
          type: 'TimeStamp',
          startTime: 0,
          endTime: 0,
          data: {
            message: 'mark: foo'
          }
        }, {
          type: 'TimeStamp',
          startTime: 0,
          endTime: 2,
          data: {
            message: 'measure: bar'
          }
        }, {
          type: 'TimeStamp',
          startTime: 1,
          endTime: 2,
          data: {
            message: 'measure: applesauce'
          }
        }, {
          type: 'TimeStamp',
          startTime: 3,
          endTime: 3,
          data: {
            message: 'mark: chutney'
          }
        }]);
      test.done();
    },

  'given a resource entry': {
    'emits ResourceSendRequest': function (test) {
      var entry = {
        name: 'http://example.com/foo',
        entryType: 'resource',
        startTime: 1,
        requestStart: 2,
        duration: 2,

        secureConnectionStart: 0,
        connectEnd: 1,
        connectStart: 1,
        domainLookupEnd: 1,
        domainLookupStart: 1,
        fetchStart: 1,
        redirectEnd: 0,
        redirectStart: 0,
        responseStart: 2,
        responseEnd: 3,
        initiatorType: 'script'
      };

      var record = sapa([entry])[0];

      test.strictEqual(record.type, 'ResourceSendRequest');

      test.strictEqual(record.data.url, entry.name, 'data.url === name');

      test.strictEqual(
        record.startTime, entry.startTime, 'startTime === startTime'
      );

      test.strictEqual(
        record.endTime, entry.requestStart, 'endTime === requestStart'
      );

      entry.requestStart = 0;
      record = sapa([entry])[0];

      test.strictEqual(
        record.endTime,
        entry.startTime,
        'if requestStart < startTime, endTime === startTime'
      );

      test.done();
    },

    'emits ResourceReceiveResponse if responseStart >= startTime':
      function (test) {
        var entry = {
          name: 'http://example.com/foo',
          entryType: 'resource',
          responseStart: 2,

          startTime: 1,
          requestStart: 2,
          duration: 2,
          secureConnectionStart: 0,
          connectEnd: 1,
          connectStart: 1,
          domainLookupEnd: 1,
          domainLookupStart: 1,
          fetchStart: 1,
          redirectEnd: 0,
          redirectStart: 0,
          responseEnd: 3,
          initiatorType: 'script'
        };

        var record = sapa([entry])[1];

        test.strictEqual(record.type, 'ResourceReceiveResponse');

        test.strictEqual(record.data.url, entry.name, 'data.url === name');

        test.strictEqual(
          record.startTime, entry.responseStart, 'startTime === responseStart'
        );

        test.strictEqual(
          record.endTime, entry.responseStart, 'endTime === responseStart'
        );

        test.done();
      },

    'does not emit ResourceReceiveResponse if responseStart < startTime':
      function (test) {
        var entry = {
          name: 'http://example.com/foo',
          entryType: 'resource',
          responseStart: 0,

          startTime: 1,
          requestStart: 2,
          duration: 2,
          secureConnectionStart: 0,
          connectEnd: 1,
          connectStart: 1,
          domainLookupEnd: 1,
          domainLookupStart: 1,
          fetchStart: 1,
          redirectEnd: 0,
          redirectStart: 0,
          responseEnd: 3,
          initiatorType: 'script'
        };

        var records = sapa([entry]);

        test.strictEqual(records.filter(function (record) {
          return record.type === 'ResourceReceiveResponse';
        }).length, 0, 'no ResourceReceiveResponse record emitted');

        test.done();
      },

    'emits ResourceReceivedData if responseStart >= startTime':
      function (test) {
        var entry = {
          name: 'http://example.com/foo',
          entryType: 'resource',
          responseStart: 2,
          responseEnd: 3,

          startTime: 1,
          requestStart: 2,
          duration: 2,
          secureConnectionStart: 0,
          connectEnd: 1,
          connectStart: 1,
          domainLookupEnd: 1,
          domainLookupStart: 1,
          fetchStart: 1,
          redirectEnd: 0,
          redirectStart: 0,
          initiatorType: 'script'
        };

        var record = sapa([entry])[2];

        test.strictEqual(record.type, 'ResourceReceivedData');

        test.strictEqual(record.data.url, entry.name, 'data.url === name');

        test.strictEqual(
          record.startTime, entry.responseStart, 'startTime === responseStart'
        );

        test.strictEqual(
          record.endTime, entry.responseEnd, 'endTime === responseEnd'
        );

        test.done();
      },

    'does not emit ResourceReceivedData if responseStart < startTime':
      function (test) {
        var entry = {
          name: 'http://example.com/foo',
          entryType: 'resource',
          responseStart: 0,
          responseEnd: 3,

          startTime: 1,
          requestStart: 2,
          duration: 2,
          secureConnectionStart: 0,
          connectEnd: 1,
          connectStart: 1,
          domainLookupEnd: 1,
          domainLookupStart: 1,
          fetchStart: 1,
          redirectEnd: 0,
          redirectStart: 0,
          initiatorType: 'script'
        };

        var records = sapa([entry]);

        test.strictEqual(records.filter(function (record) {
          return record.type === 'ResourceReceivedData';
        }).length, 0, 'no ResourceReceivedData record emitted');

        test.done();
      },

    'emits ResourceFinish': function (test) {
      var entry = {
        name: 'http://example.com/foo',
        entryType: 'resource',
        responseEnd: 3,

        startTime: 1,
        requestStart: 2,
        duration: 2,
        secureConnectionStart: 0,
        connectEnd: 1,
        connectStart: 1,
        domainLookupEnd: 1,
        domainLookupStart: 1,
        fetchStart: 1,
        redirectEnd: 0,
        redirectStart: 0,
        responseStart: 2,
        initiatorType: 'script'
      };

      var record = sapa([entry])[3];

      test.strictEqual(record.type, 'ResourceFinish');

      test.strictEqual(record.data.url, entry.name, 'data.url === name');

      test.strictEqual(
        record.startTime, entry.responseEnd, 'startTime === responseEnd'
      );

      test.strictEqual(
        record.endTime, entry.responseEnd, 'endTime === responseEnd'
      );

      test.done();
    }
  }
};
