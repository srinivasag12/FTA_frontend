// Define variables
const helmet = require('helmet');
const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');


console.log("Starting");

// Use the /dist directory
app.use(express.static(__dirname + '/dist/IRICloud'));

// Catch all other invalid routes
app.all('*', function(req,res){
    res.status(200).sendFile(__dirname + '/dist/IRICloud/index.html');
});

// app.listen(5200, function() {
//     console.log('Express server listening on port with https : ' + 5200);
// });

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(443, () => {
    console.log('Listening... on 443')
  })