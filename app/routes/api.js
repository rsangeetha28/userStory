var User = require('../models/user');

var Story = require('../models/story');

var config = require('../../config');

var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user){

	var token = jsonwebtoken.sign({

		id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, {
		expiresInMinute: 1440

	});

	return token;
}

module.exports = function(app, express, io){

	var api = express.Router();

	api.get('/all_stories',function(req,res){

		Story.find({}, function(err,stories){
			
			if(err){
				res.send(err);
				return;
			}

			res.json(stories);
		});
	});

	//The following logic helps to get the user details and store the entered values in database(MongoDB)
	//Since we are going to store values, we have to use "POST" method
	api.post('/signup', function(req,res) {

		var user = new User({
			name: req.body.name,
			username: req.body.username,
			password: req.body.password
		});

		var token = createToken(user);

		//Save the above entered value in database
		user.save(function(err) {
			if(err)
			{
				res.send(err);
				return;
			}
			res.json({
				success: true,
				message: 'User has been created!',
				token: token
			});

		});

	});

	//The following function helps to retrieve all the users present in database. Similar to select query in sql.
	//As we want to retrieve values from database, we have to use "GET" method
	api.get('/users',function(req,res) {

		//Finding all users in database which Mongoose use
		User.find({},function(err,users){

			if(err)
			{
				res.send(err);
				return;
			}

			res.json(users);
		});
	});



	//The following logic validates whether given username and password exist in database. In other words, the value is valid or not.
	//findOne will look for a particular object in database.
	api.post('/login',function(req,res){

		User.findOne({
			username: req.body.username
		}).select('name username password').exec(function(err,user){

			if (err) throw err;

			if(!user) {

				res.send({message: "User doesnt exist"});

			}else if(user){

				var validPassword = user.comparePassword(req.body.password);

				if(!validPassword){
					res.send({message: "Invalid password"});
				}else {

					//There are two methods of authentication available. One is session-based and other is token-based. In session-based approach, a new session
					//will be created by server everytime user login and server takes space for creating session for each user. So this is not a scalable approach
					//when we want to handle large number of users whereas in token-based approach user request will be sent along with HTTP request and no separate 
					//session created for use hence scalable. One of the main advantage of token-based approach is a secret key will be shared between user and server.
					//If the secret key is made really strong, then it will be impossible to decrypt the information sent to server by user. In our example taken here,
					//information such as id, name, username will be encoded using key named "secretKey". 

					var token = createToken(user);

					res.json({
						success: true,
						message: "Successfully login!",
						token: token
					});

				}
			}
		});
	});

	//The following function will help in authenticating the user using the token already encoded. If authentication is successful,
	//then control will pass to next function.
	api.use(function(req, res, next){

		console.log("Somebody just came to our app!");

		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		if(token)	{

			jsonwebtoken.verify(token, secretKey, function(err,decoded){

				if(err){

					res.status(403).send({success: false, message: "Failed to authenticate user"});
				}else{

					req.decoded=decoded;
					next();
				}	
			});
		} else {

			res.status(403).send({success: false, message: "No Token Provided"});
		}
	});	

	//Destination B // provide a legitimate token

	api.route('/')

		.post(function(req,res){

			var story = new Story({

				creator: req.decoded.id,
				content: req.body.content,

			});

			story.save(function(err, newStory){

				if(err){

					res.send(err);
					return
				}
				io.emit('story',newStory);
				res.json({message: "New Story Created!"});
			});
		})

		.get(function(req,res){

			Story.find({creator: req.decoded.id}, function(err,stories){

				if(err){
					res.send(err);
					return;
				}
				res.json(stories);
			});
		});


		//The following function is created to get complete information about the user including name, username, id and so on
		//which is available in createToken function.
		api.get('/me', function(req,res){

			res.json(req.decoded);
		});

		

	return api
}