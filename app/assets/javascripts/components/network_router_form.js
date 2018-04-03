ManageIQ.angular.app.component('networkRouterForm',{
  controller: 'networkRouterFormController',
  controllerAs: 'vm',
  templateUrl: '/static/network-router-form.html.haml',
  bindings: {
    'networkRouterId': '@',
    'networkProviderChoices' : '<'
  },
});

networkRouterFormController.$inject = [ '$http', '$scope', 'miqService'];

function networkRouterFormController($http, $scope, miqService) {
  var vm = this;
  var init = function() {
  vm.networkRouterModel = {
    name: '',
    cloud_subnet_id: '',
  };
  vm.formId = vm.networkRouterId;
  vm.afterGet = false;
  vm.modelCopy = angular.copy( vm.networkRouterModel );
  vm.model = "networkRouterModel";

  vm.saveable = miqService.saveable;

  ManageIQ.angular.scope = vm;

    if (vm.networkRouterId == 'new') {
      vm.networkRouterModel.name = "";
      vm.networkRouterModel.enable_snat = true;
      vm.networkRouterModel.external_gateway = false;
      vm.networkRouterModel.cloud_subnet_id = null;
      vm.newRecord = true;
    } else {
      miqService.sparkleOn();

      $http.get('/network_router/network_router_form_fields/' + vm.networkRouterId)
        .then(getNetworkRouterFormData)
        .catch(miqService.handleFailure);
    }
  }


  vm.addClicked = function() {
    var url = 'create/new' + '?button=add';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.cancelClicked = function() {
    if (vm.networkRouterId == 'new') {
      var url = '/network_router/create/new' + '?button=cancel';
    } else {
      var url = '/network_router/update/' + vm.networkRouterId + '?button=cancel';
    }
    miqService.miqAjaxButton(url);
  };

  vm.saveClicked = function() {
    var url = '/network_router/update/' + vm.networkRouterId + '?button=save';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.addInterfaceClicked = function() {
    miqService.sparkleOn();
    var url = '/network_router/add_interface/' + vm.networkRouterId + '?button=add';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.removeInterfaceClicked = function() {
    miqService.sparkleOn();
    var url = '/network_router/remove_interface/' + vm.networkRouterId + '?button=remove';
    miqService.miqAjaxButton(url, vm.networkRouterModel, { complete: false });
  };

  vm.resetClicked = function() {
    vm.networkRouterModel = angular.copy( vm.modelCopy );
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", "All changes have been reset");
  };

  vm.filterNetworkManagerChanged = function() {
    miqService.sparkleOn();
    $http.get('/network_router/network_router_networks_by_ems/' + vm.networkRouterModel.ems_id)
      .then(getNetworkRouterFormByEmsData)
      .catch(miqService.handleFailure);

    miqService.getProviderTenants(function(data) {
      vm.available_tenants = data.resources;
    })(vm.networkRouterModel.ems_id);
  };

  vm.filterCloudNetworkChanged = function(id) {
    miqService.sparkleOn();
    $http.get('/network_router/network_router_subnets_by_network/' + id)
      .then(getNetworkRouterFormByNetworkData)
      .catch(miqService.handleFailure);
  };

  function getNetworkRouterFormData(response) {
    var data = response.data;

    vm.afterGet = true;

    Object.assign(vm, _.pick(data, ['available_networks', 'available_subnets']));
    Object.assign(vm.networkRouterModel, _.omit(data, ['available_networks', 'available_subnets']));

    vm.modelCopy = angular.copy( vm.networkRouterModel );
    miqService.sparkleOff();
  }

  function getNetworkRouterFormByEmsData(response) {
    var data = response.data;

    vm.available_networks = data.available_networks;
    miqService.sparkleOff();
  }

  function getNetworkRouterFormByNetworkData(response) {
    var data = response.data;

    vm.available_subnets = data.available_subnets;
    miqService.sparkleOff();
  }

  vm.$onInit = init;
}
