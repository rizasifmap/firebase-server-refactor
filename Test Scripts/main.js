var express = require('express');
var app = express();
var path = require("path");

app.get('/add', function (req, res) {
  res.sendFile(path.join(__dirname+'/add_user.html'));
})

app.get('/addcon', function (req, res) {
  res.sendFile(path.join(__dirname+'/add_connection.html'));
})

app.get('/search', function (req, res) {
  res.sendFile(path.join(__dirname+'/search.html'));
})

app.get('/block', function (req, res) {
  res.sendFile(path.join(__dirname+'/block_user.html'));
})

app.get('/unblock', function (req, res) {
  res.sendFile(path.join(__dirname+'/unblock_user.html'));
})

app.get('/addaddr', function (req, res) {
  res.sendFile(path.join(__dirname+'/add_address.html'));
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})