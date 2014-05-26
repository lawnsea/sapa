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
    }
};
