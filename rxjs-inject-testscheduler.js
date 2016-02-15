var injectRxJsTestScheduler = {
  _originals: {
    prototypes: {
      debounce: Rx.Observable.prototype.debounce,
      throttle: Rx.Observable.prototype.throttle,
      delay: Rx.Observable.prototype.delay,
      delaySubscription: Rx.Observable.prototype.delaySubscription,
      timeout: Rx.Observable.prototype.timeout,
      sample: Rx.Observable.prototype.sample,
      bufferWithTime: Rx.Observable.prototype.bufferWithTime,
      windowWithTime: Rx.Observable.prototype.windowWithTime,
      timeInterval: Rx.Observable.prototype.timeInterval,
    },
    observable: {
      interval: Rx.Observable.inverval,
      timer: Rx.Observable.timer,
    },
  },

  _spies: {},

  _injectInto: function _injectIntoPrototype(method, schedulerInstance, isProto) {
    var containerObj = (isProto) ? Rx.Observable.prototype : Rx.Observable;
    var original = (isProto) ? injectRxJsTestScheduler_originals.prototypes[method] : injectRxJsTestScheduler._originals.observable[method];

    switch (method) {
      case 'timeout':
        spyOn(containerObj, 'timeout').and.callFake(function() {
          if (!_.isFunction(args[1])) {
            return original.call(this, args[0], args[1], schedulerInstance);
          }
          return original.apply(this, args);
        });
        break;

      case 'bufferWithTime':
        spyOn(containerObj, 'bufferWithTime').and.callFake(function() {
          if (_.isNumber(args[1])) {
            return original.call(this, args[0], args[1], schedulerInstance);
          }
          return original.call(this, args[0], schedulerInstance);
        });
        break;

      case 'windowWithTime':
        spyOn(containerObj, 'windowWithTime').and.callFake(function() {
          if (!_.isNumber(args[1])) {
            return original.call(this, args[0], schedulerInstance);
          }
          return original.apply(this, args);
        });
        break;
      default:
        spyOn(containerObj, method).and.callFake(function() {
          var args = [];
          for (var i = 0; i < original.length; i++) {
            args[i] = arguments[i];
          }

          args[args.length-1] = schedulerInstance;
          return original.apply(this, args);
        });
    }

    return containerObj[method];
  },

  injectInto: function injectInto(method, schedulerInstance) {
    if (_.has(injectRxJsTestScheduler._originals.prototypes, method)) {
      return _injectInto(method, schedulerInstance, true);
    } else if (_.has(injectRxJsTestScheduler._originals, method)) {
      return _injectInto(method, schedulerInstance, false);
    } else {
      throw new Error('this method can\'t be injected with a scheduler');
    }
  },

  inject: function inject(schedulerInstance) {
    injectRxJsTestScheduler._spies = {};
    _.forEach(injectRxJsTestScheduler._originals.observable, function(original, method) {
      injectRxJsTestScheduler._spies[method] = _injectInto(key, schedulerInstance, false);
    });

    _.forEach(injectRxJsTestScheduler._originals.prototypes, function(original, method) {
      injectRxJsTestScheduler._spies[method] = _injectInto(key, schedulerInstance, true);
    });

    return injectRxJsTestScheduler._spies;
  },
};
