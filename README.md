# event-custom

custom event register and fire like dom event

[![modulex-event-custom](https://nodei.co/npm/modulex-event-custom.png)](https://npmjs.org/package/modulex-event-custom)
[![NPM downloads](http://img.shields.io/npm/dm/modulex-event-custom.svg)](https://npmjs.org/package/modulex-event-custom)
[![Build Status](https://secure.travis-ci.org/kissyteam/event-custom.png?branch=master)](https://travis-ci.org/kissyteam/event-custom)
[![Coverage Status](https://img.shields.io/coveralls/kissyteam/event-custom.svg)](https://coveralls.io/r/kissyteam/event-custom?branch=master)
[![Dependency Status](https://gemnasium.com/kissyteam/event-custom.png)](https://gemnasium.com/kissyteam/event-custom)
[![Bower version](https://badge.fury.io/bo/modulex-event-custom.svg)](http://badge.fury.io/bo/modulex-event-custom)
[![node version](https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square)](http://nodejs.org/download/)

[![browser support](https://ci.testling.com/kissyteam/event-custom.png)](https://ci.testling.com/kissyteam/event-custom)


## example on node

```javascript
var event = require('modulex-event-custom');
var xutil = require('modulex-util');
var target= xutil.mix({},event.Target);
target.on('my', function(){
});
target.fire('my');
```