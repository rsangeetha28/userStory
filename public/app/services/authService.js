//We can think of a module as a container for the different parts of your app – controllers, services, filters, directives, etc.
//Most applications have a main method that instantiates and wires together the different parts of the application.
//Angular apps don't have a main method. Instead modules declaratively specify how an application should be bootstrapped.

//The following line helps to create an angular service/application
angular.module('authService',[])


//If you use a service you will get the instance of a function ("this" keyword).
//If you use a factory you will get the value that is returned by invoking the function reference (the return statement in factory).
//Factory is commonly used to create "common" functions that can be called by multiple Controllers

//The following function is about creating a factory and name of the factory is 'Auth'
//$http for fetching all requests. $q as a promising object and AuthToken is another factory object.
//To fetch an api from a server, we will be using factory() module
.factory('Auth',function($http, $q, AuthToken){

	//authFactory is a variable using which all $http request will be made
	//and this variable will help to store all factory methods(login,logout,isLoggedIn,and,so on)
	var authFactory = {};

	//The following function is to login user into the system
	//The following line help to fetch login api from api.js and save value to front-end framework.
	authFactory.login = function(username, password){

		//Since we have used post method in api.js for login api, we will be using same post method here
		return $http.post('/api/login', {
			username: username,
			password: password
		})
		//The following is a promising function which will help in fetching a token if the login is successful.
		//Whenever we login, a token will be created as a sign of successful login using which we can perform all other function
		.success(function(data){

			//The method seToken() when passed with parameter implies we are getting the token and setting the token to user. When setToken()
			//is not passed with any parameter then we are clearing the token and not making it available to anyone.
			AuthToken.setToken(data.token)
			return data;
		})
	}

	//The following function is to help user logout the system.
	//The following logic will help in clearing the token if user logout the system
	authFactory.logout = function() {

		AuthToken.setToken();
	}

	//The following function checks on every $http request whether user has got token after login to the system.
	authFactory.isLoggedIn = function() {

		if(AuthToken.getToken())
			return true;
		else
			return false;
	}

	//The following function helps to fetch complete information about user including id, name, username and so on using /api/me which will 
	//call createToken() function to get all information about user.
	authFactory.getUser = function(){

		if(AuthToken.getToken())
			return $http.get('/api/me');
		else
			return $q.reject({message: "User has no token"});
	}

	//Whenver we create a variable to store methods, we need to return back that variable at the end of factory function.
	return authFactory;
})

//When we didnt put semicolon after '})' and start with a dot, then we are continuing a chain function over here.
//This factory will help in getting the token from browser. So object $window is used to get and set the token.
.factory('AuthToken', function($window){

	//Note we have created a variable named authFactory in the factory named 'Auth' and again we are using same name to create variable.
	//So this implies both variables have no relationship as each one is in different factory and more or less like a local variable we use in our function.
	var authFactory = {};

	authFactory.getToken = function (){

		return $window.localStorage.getItem('token');
	}

	authFactory.setToken = function(token) {

		if(token){
			//localStorage is a variable in browser which will store key and value when user a login to the system.
			//Note after we login when we give InspectElement->Local Storage->
    		//http://localhost:3000 we can see the key and value stored in browser
			$window.localStorage.setItem('token',token);
		}
		else{

			$window.localStorage.removeItem('token');
		}
	}

	return authFactory;
})

//The following factory will help in determining whether token exist or not for a given $http request.
.factory('AuthInterceptor', function($q, $location, AuthToken){

	var interceptorFactory = {};

	interceptorFactory.request = function(config){

		var token = AuthToken.getToken();

		if(token){

			//This will help in directing to other websites also
			config.headers['x-access-token'] = token;
		}

		return config;
	};


	return interceptorFactory;
});