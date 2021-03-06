var should = require('should')
  , semver = require('semver')
  , zmq = require('../');
  
if (semver.gte(zmq.version, '4.0.0')) {
  var zap = require('./zap')
  	, port = 'tcp://127.0.0.1:12346'
    , zapSocket = zap.start()
    , rep = zmq.socket('rep')
    , req = zmq.socket('req');

  rep.on('message', function(msg){
    msg.should.be.an.instanceof(Buffer);
    msg.toString().should.equal('hello');
    rep.send('world');
  });

  rep.zap_domain = "test";
  rep.plain_server = 1;
  rep.mechanism.should.eql(1);

  var timeout = setTimeout(function() {
    req.close();
    rep.close();
    zapSocket.close();
    throw new Error("Request timed out");
  }, 1000);

  rep.bind(port, function(){
    req.plain_username = "user";
    req.plain_password = "pass";
    req.mechanism.should.eql(1);

    req.connect(port);
    req.send('hello');
    req.on('message', function(msg){
      msg.should.be.an.instanceof(Buffer);
      msg.toString().should.equal('world');
      clearTimeout(timeout);
      req.close();
      rep.close();
      zapSocket.close();
    });
  });
}
