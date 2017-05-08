(function(){
    function AppController($scope){
        var vm = this;

        /**
         * TODO : Make changes to the below URLs to suit your Oracle WebCenter
         * environment.
         */        
        var restBaseUrl = "http://wchost.lan/rest";
        var wcBaseUrl = "http://wchost.lan/webcenter";
        var csBaseUrl = "http://wchost.lan/cs";
    
        WebCenter.Config.setRestBaseUrl(restBaseUrl);
        WebCenter.Config.setWcBaseUrl(wcBaseUrl);
        WebCenter.Config.setCsBaseUrl(csBaseUrl);
        
        function resetForm(){
            vm.userProfile=null;
            vm.username="";
            vm.password="";
            vm.isBusy=false;
            vm.statusText="";
        }

        function getActivityStream(){
            WebCenter.ActivityStream.getActivities().then(function(activities){
                if(activities && activities.items.length > 0){
                    $scope.$apply(function() {
                        vm.activities = activities.items.map(function(activity){
                            activity = WebCenter.ActivityStream.processActivity(activity);
                            activity.primaryActorPic = activity.primaryActor.links.filter(function(link){
                                                            return (link.rel === "urn:oracle:webcenter:people:icon" && link.resourceType === "urn:oracle:webcenter:people:person");
                                                        })[0].template.replace("{size}","MEDIUM");
                            return activity;
                        });
                    });
                }
            },function(error){
                Materialize.toast('Failed to load Activities !!!', 3000, 'rounded') 
            });
        }

        vm.updateStatus = function(){
            var statusText = vm.statusText;
            vm.isBusy =true;
            WebCenter.People.updateStatus(statusText).then(function(result){
                Materialize.toast('Status updated !!!', 3000, 'rounded') 
                getActivityStream();
                $scope.$apply(function() {
                    resetForm();
                });
            },function(error){
                Materialize.toast('Error updating Status !!!', 3000, 'rounded') 
            });
        }

        vm.onLogin = function(){
            WebCenter.Auth.setUserName(vm.username);
            WebCenter.Auth.setPassword(vm.password);
            vm.isBusy = true;
            WebCenter.Auth.login().then(function(resourceIndex){
                Materialize.toast('Login Success !!!', 3000, 'rounded') 
                WebCenter.Auth.getCurrentUser().then(function(currUser){
                    $scope.$apply(function() {
                        vm.userProfile = currUser;                        
                        vm.profilePic = currUser.links.filter(function(link){
                            return (link.rel === "urn:oracle:webcenter:people:icon" && link.resourceType === "urn:oracle:webcenter:people:person");
                        })[0].template.replace("{size}","MEDIUM");
                        resetForm();
                        vm.isLoggedIn=true;
                    });
                    getActivityStream();
                },function(profileError){
                    $scope.$apply(function() {
                        vm.resetForm();
                        vm.isLoggedIn=true;
                    });
                });
            },function(error){
                console.log(error);
                $scope.$apply(function() {
                    vm.resetForm();
                    vm.isLoggedIn=false;
                });
                Materialize.toast('Login Failed !!!', 3000, 'rounded') 
            });
        };    
    }
    var app = angular.module("WebCenterJSApp",["ui.materialize"]);
    app.controller("AppController",["$scope",AppController]);
})();
