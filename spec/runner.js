"use strict";
const Jasmine = require("jasmine");
const JasmineReporters = require("jasmine-reporters");
const j = new Jasmine();
var consoleReporter = new Jasmine.ConsoleReporter({
    showColors: true,
    timer: new jasmine.Timer,
    print: function() {
      console.log.apply(console, arguments)
    }
  });

var terminalReporter = new JasmineReporters.TerminalReporter({
    color: true,
    verbosity: 3,
    showStack: true
  });

j.loadConfigFile("spec/support/jasmine.json");
// j.addReporter(consoleReporter);
j.addReporter(terminalReporter);

j.onComplete(function (passed) {
    /* if (passed) {
        console.log("All specs have passed");
    }
    else {
        console.log("At least one spec has failed");
    }*/
});
j.execute();


//http://stateofjs.com/2016/introduction/