//This file contains information about data we are going to store in Mongo database.
var mongoose = require('mongoose');
//Creating a user schema using mongoose schema.
var Schema = mongoose.Schema;
//In order to hash the password, we need to install a module called 'bcrypt-nodejs'
var bcrypt = require('bcrypt-nodejs');
var UserSchema = new Schema ({
	name: String,
	//username is mandatory so required is true, and it should be unique so index value is set true.
	username: {type: String, required: true, index: {unique: true}},
	//When we query the database for username, we dont want to query the password. So we set select value to be false.
	password: {type: String, required: true, select: false}
});

//pre() here specifies that we want to hash the password before saving it to the 
//database.
UserSchema.pre('save',function(next) {
	//this here points to UserSchema object
	var user=this;
	//If the user password is not modified then go to next statement to be executed.
	if(!user.isModified('password')) return next();

	//The following will check if the password is present and if there is an error it
	//will not stop go to next and if there is no error, then password will be hashed 
	//before saving value to database. Once hashed, control will be passed to next.
	bcrypt.hash(user.password,null,null,function(err,hash) {
		if(err) return next(err);

		user.password = hash;
		next();
	});
});

//The following function simply compares the password entered by user with the one already 
//present in the database. Since we have hashed the password using bcrypt, we need to make 
//use of same function so that it will decrypt the passowrd in database and compare with the one entered by user.
UserSchema.methods.comparePassword = function(password){

	var user=this;

	return bcrypt.compareSync(password,user.password);

}

module.exports=mongoose.model('User',UserSchema);