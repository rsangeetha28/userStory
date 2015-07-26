//Controller is a way to manipulate the data and once manipulated we can give the data to views. So that views can render the data.
angular.module('mainCtrl',[])

.controller('MainController',function($rootScope, $location, Auth){

	var vm = this;

	vm.loggedIn = Auth.isLoggedIn();

	$rootScope.$on('$routeChangeStart', function(){

		vm.loggedIn = Auth.isLoggedIn();

		Auth.getUser()
			//then() is a function which helps in getting validating stuffs.
			.then(function(data){
				vm.user = data.data;
			});
	});

	vm.doLogin = function(){

		vm.processing = true;

		vm.error = '';

		Auth.login(vm.loginData.username, vm.loginData.password)
			.success(function(data){
				vm.processing = false;

				Auth.getUser()
					.then(function(data){
						vm.user = data.data;
					});

				if(data.success)
					$location.path('/');
				else
					vm.error = data.message;
			});
	}

	vm.doLogout = function(){
		Auth.logout();
		$location.path('/logout');
	}
});