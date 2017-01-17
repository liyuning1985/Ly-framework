'use strict'
var http = require('http');
var express = require('express');
var app = express();
var router = module.exports = express.Router();
var opt = {
    setHeader:function(res,path,stat){
        res.set("X-FRAME-OPTIONS", "SAMEORIGIN");
    }
    //index:"Login.html"
}
app.use(express.static('page',opt));
//app.use(express.static('webapp',opt));
var PORT = 8888;
var HOST_NAME;


http.createServer(app).listen(PORT,function(){
    console.log('Web server listening on port '+PORT);
});
