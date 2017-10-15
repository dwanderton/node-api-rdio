var express = require('express');
var app = express();

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
const fs = require('fs');
const http = require("http");
var request = require("request");

/* logging start */
const winston = require('winston');
var expressWinston = require('express-winston');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `${logDir}/-results.log`,
      timestamp: tsFormat,
      maxsize: 5242880,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: env === 'development' ? 'verbose' : 'info'
    })
  ]
});

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      //json: true,
      colorize: true
    })
  ],
  colorize: true,
  meta: false,
  msg: "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
}));
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}));

/* logger.debug('Debugging info');
logger.verbose('Verbose info');
logger.info('Hello world');
logger.warn('Warning message');
logger.error('Error info');

logging end */

// set the port of our application
// process.env.PORT lets the port be set by Heroku

var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function(req, res) {

	// ejs render automatically looks in the views folder
	res.render('index');
});

app.listen(port, function() {
  logger.info('app is running on http://localhost:' + port);
});

// do some aws stuff as a test

/*
// Read in the file, convert it to base64, store to S3
fs.readFile('del.txt', function (err, data) {
  if (err) { throw err; }

  var base64data = new Buffer(data, 'binary');

  var s3 = new AWS.S3();
  s3.client.putObject({
    Bucket: 'banners-adxs',
    Key: 'del2.txt',
    Body: base64data,
    ACL: 'public-read'
  },function (resp) {
    console.log(arguments);
    console.log('Successfully uploaded package.');
  });
});
*/
var options = {
    uri: "http://r.ddmcdn.com/s_f/o_1/cx_462/cy_245/cw_1349/ch_1349/w_720/APL/uploads/2015/06/caturday-shutterstock_149320799.jpg",
    encoding: null
};
request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
        console.log("failed to get image");
        console.log(error);
    } else {
        s3.putObject({
            Body: body,
            Key: "",//path,
            Bucket: 'bucket_name'
        }, function(error, data) {
            if (error) {
                console.log("error downloading image to s3");
                console.log(error);
            } else {
                console.log("success uploading to s3");
            }
        });
    }
});
