//module.exports is the object that's actually returned as the result of a require call.
module.exports = {
	//Here root is the database username and 123456 is the password for that user
	"database" : "mongodb://root:123456@ds029811.mongolab.com:29811/userstory",
	"port" : process.env.PORT || 3000,
	"secretKey" : "YourSecretKey"
}