var app = angular.module('TabScrollDemo', ['ui.bootstrap', 'ui.tab.scroll']);

app.config(function(scrollableTabsetConfigProvider){
    scrollableTabsetConfigProvider.setShowTooltips (true);
    scrollableTabsetConfigProvider.setTooltipLeft('right');
    scrollableTabsetConfigProvider.setTooltipRight('left');
})

app.controller('MainCtrl', function($scope) {
  $scope.tabs = [];
  for(var i=0; i<25; i++) {
    $scope.tabs.push({
      heading: 'Tab ' + i,
      content: 'This is the content for tab ' + i
    });
  }
});
