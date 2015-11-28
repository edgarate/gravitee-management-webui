/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ApplicationController {
  constructor($stateParams, $mdDialog, $q, $state, $scope, ApplicationService, NotificationService) {
		'ngInject';
		this.$stateParams = $stateParams;
		this.$mdDialog = $mdDialog;
		this.$q = $q;
		this.$state = $state;
		this.ApplicationService = ApplicationService;
		this.NotificationService = NotificationService;
		this.applicationId = $stateParams.applicationId;
		this.application = {};
		this.applications = [];
		this.apiKeys = [];
		this.members = [];
		this.membershipTypes = [ 'owner', 'user' ];
		if (this.applicationId) {
				this.get(this.applicationId);
				this.getAPIKeys(this.applicationId);
				this.getMembers(this.applicationId);
		}
		if ($state.current.name.endsWith('dashboard')) {
      $scope.selectedTab = 0;
    } else if ($state.current.name.endsWith('general')) {
      $scope.selectedTab = 1;
    } else if ($state.current.name.endsWith('apis')) {
      $scope.selectedTab = 2;
    } else if ($state.current.name.endsWith('members')) {
      $scope.selectedTab = 3;
    }
	}

	get(applicationId) {
		this.ApplicationService.get(applicationId).then(response => {
      this.application = response.data;
    });
  }

	getAPIKeys(applicationId) {
		this.ApplicationService.getAPIKeys(applicationId).then(response => {
			this.apiKeys = response.data;
		});
	}

	getMembers(applicationId) {
		this.ApplicationService.getMembers(applicationId).then(response => {
			this.members = response.data;
		});
	}

	updateMember(member) {
		this.ApplicationService.addOrUpdateMember(this.application.id, member).then(() => {
			this.NotificationService.show('Member updated');
		});
	}

	deleteMember(member) {
		var index = this.members.indexOf(member);
		this.ApplicationService.deleteMember(this.application.id, member.user).then(() => {
			this.members.splice(index, 1);
			this.NotificationService.show("Member " + member.user + " has been removed successfully");		
		});
	}

  update(application) {
		this.ApplicationService.update(application).then(() => {
			this.NotificationService.show('Application updated');
		});
  }

  delete(application) {
		this.ApplicationService.delete(application).then(() => {
			this.NotificationService.show('Application ' + application.name + ' deleted');
			this.$state.go('applications.thumb');
		});
  }

	unsubscribeAPI(application, apiId, apiKey) {
		this.ApplicationService.unsubscribe(application, apiKey).then(() => {
			this.NotificationService.show('Application unsubscribed');
			this.getAPIKeys(application.id);
		});
	}

	generateAPIKey(application, apiId) {
		this.ApplicationService.subscribe(application, apiId).then(() => {
			this.NotificationService.show('New API Key created');
			this.getAPIKeys(application.id);
		});
	}

	showConfirm(ev) {
    var confirm = this.$mdDialog.confirm()
      .title('Would you like to delete your application?')
      .ariaLabel('delete-application')
      .ok('OK')
      .cancel('Cancel')
      .targetEvent(ev);
	
		var self = this;
    this.$mdDialog.show(confirm).then(function() {
      self.delete(self.application);
    }, function() {
      self.$mdDialog.cancel();
    });
  }

	showSubscribeApiModal(ev) {
		var that = this;
    this.$mdDialog.show({
      controller: 'DialogSubscribeApiController',
      templateUrl: 'app/application/dialog/subscribeApi.dialog.html',
      parent: angular.element(document.body),
			targetEvent: ev,
      clickOutsideToClose: true,
			application: that.application,
			apiKeys: that.apiKeys
    }).then(function (application) {
      if (application) {
        that.getAPIKeys(application.id);
      }
    }, function() {
       // You cancelled the dialog
    });
	}

	showAddMemberModal(ev) {
		var that = this;
    this.$mdDialog.show({
      controller: 'DialogAddMemberController',
      templateUrl: 'app/application/dialog/addMember.dialog.html',
      parent: angular.element(document.body),
			targetEvent: ev,
      clickOutsideToClose: true,
			application: that.application
    }).then(function (application) {
      if (application) {
        that.getMembers(application.id);
      }
    }, function() {
       // You cancelled the dialog
    });
	}

	bgColorByIndex(index) {
    switch (index % 6) {
      case 0 :
        return '#f39c12';
      case 1 :
        return '#29b6f6';
      case 2 :
        return '#26c6da';
      case 3 :
        return '#26a69a';
      case 4 :
        return '#259b24';
      case 5 :
        return '#26a69a';
      default :
        return 'black';
    }
  }
}

export default ApplicationController;