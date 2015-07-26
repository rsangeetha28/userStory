//package.json - this file holds various metadata(header) relevant to the project. This file is used to give information to npm that allows 
//it to identify the project as well as handle the project's dependencies. It can also contain other metadata such as a project description, 
//the version of the project in a particular distribution, license information, even configuration data - all of which can be vital to both npm 
//and to the end users of the package.
//The dependencies field is used to list all the dependencies of your project that are available on npm. When someone installs your project 
//through npm, all the dependencies listed will be installed as well. Additionally, if someone runs npm install in the root directory of your 
//project, it will install all the dependencies to ./node_modules.

//Node.js follows the CommonJS module system, and the builtin require function is the easiest way to include modules that exist in separate files. 
//The basic functionality of require is that it reads a javascript file, executes the file, and then proceeds to return the exports object. 

//Express, body-parser, morgan are frameworks which helps in running the application run smoothly. 
//To use express,body-parse,morgan,mongoose frameworks, we need to install them in our current directory using following command
//npm install express body-parser morgan --save
//npm install mongoose --save
//The purpose of giving "--save" is the framwork names will be automatically added to package.json file so we dont have to manually define them.
//Note npm stands for node package manager

var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

//When we want a javascript file to be used in program, we need to use "./" followed by file name. If we want to use a javascript file which is not present in
//current directory but in parent directory then we have to use "../..".
//The config file will contain all parameters which we want to use in our program so we dont have to explicitly specify parameters everytime.

var config = require("./config");
var mongoose = require('mongoose');
//When we want to use express, we need to call the module explicitly and assign the value to an object.
var app = express();

//The following fuction demonstrated whether connection to database is success or not.
mongoose.connect(config.database,function(err)
{
	if(err)
	{
		console.log(err);
	}
	else
	{
		console.log('Connected to the database');
	}
});


var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

//extended :true implies function will parse text,image,audio,video files and not just restricted to text files alone.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

//The following line is used in order to render CSS or Javascript files
app.use(express.static(__dirname + '/public'));
//We need to pass app and express parameter then only express.Router() function call
//in api.js will work otherwise it will treat express to be a local parameter there.
var api = require('./app/routes/api')(app, express, io);
//The following will help prefix all js files inside api with '/api'
//An example can be localhost:3000/api/signup
app.use('/api',api);


//The parameter '*' specifies whatever route we pass/request for the route will point to following url '/public/views/index.html' always.
app.get('*',function (req,res) {
	res.sendFile(__dirname + '/public/app/views/index.html');
});

//The following will make server listen to given port and if server is active, it will print message otherwise will print error log.
http.listen(config.port,function(err){
	if(err){
		console.log(err);
	}
	else{
		console.log("Listening on port 3000");
	}
});