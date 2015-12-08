var app = angular.module('TabScrollDemo', ['ui.bootstrap', 'ui.tab.scroll']);

app.config(function(scrollableTabsetConfigProvider){
  scrollableTabsetConfigProvider.setShowTooltips (true);
  scrollableTabsetConfigProvider.setTooltipLeftPlacement('bottom');
  scrollableTabsetConfigProvider.setTooltipRightPlacement('left');
});

app.controller('MainCtrl', function() {
  var vm = this;
  vm.tabs = [];
  vm.scrlTabsApi = null;

  vm.reCalcScroll = function() {
    vm.scrlTabsApi.doRecalculate();
  };

  vm.scrollIntoView = function(arg) {
    vm.scrlTabsApi.scrollTabIntoView(arg);
  };

  vm.addTab = function(){
    vm.tabs.push({
      heading: 'New Tab ' + vm.tabs.length,
      content: 'This is the content for a NEW tab ' + vm.tabs.length
    });
  };

  vm.removeTab = function(){
    vm.tabs.splice(vm.tabs.length - 1, 1);
  };

  for(var i=0; i<15; i++) {
    vm.tabs.push({
      heading: 'Tab ' + i,
      content: 'This is the content for tab ' + i
    });
  }

});
