angular.module('ui.tab.scroll', [])
.directive('scrollableTabset', [
  '$window', '$interval', '$timeout',
  function($window, $interval, $timeout) {

    var timeoutId = null;

    var cancelId = function() {
        if(timeoutId) {
          $interval.cancel(timeoutId);
          timeoutId = null;
        }
    };

    var bindHoldFunctionTo = function(element, fn) {

      //get rid of the previous scroll function
      element.unbind('mousedown');
      element.unbind('mouseup');

      var isHolding = false;

      var mouseDown = function() {
        isHolding = true;

        fn();

        timeoutId = $interval(function() {
          if(isHolding) {
            fn();

            if(element.is(':disabled')) {
              cancelId();
            }
          }
        }, 100);
      };

      var mouseUp = function() {
        isHolding = false;
        cancelId();
      };

      element.on('mousedown', mouseDown);
      element.on('mouseup', mouseUp);
    };

    return {
      restrict: 'AE',
      transclude: true,

      scope: {
        showTooltips: '=',
        watchExpression: '=',
        tooltipLeft: '=',
        tooltipRight: '=',
        tooltipTextSelector: '='
      },

      template: [
        '<div class="ui-tabs-scrollable">',
          '<button ng-hide="hideButtons" ng-disabled="disableLeft()" class="btn nav-button left-nav-button" tooltip-placement="{{tooltipLeftDirection()}}" tooltip-html-unsafe="{{tooltipLeftContent()}}">',
            '<span class="glyphicon glyphicon-chevron-left"></span>',
          '</button>',
          '<div class="spacer" ng-class="{\'hidden-buttons\': hideButtons}" ng-transclude></div>',
          '<button ng-hide="hideButtons" ng-disabled="disableRight()" class="btn nav-button right-nav-button" tooltip-placement="{{tooltipRightDirection()}}" tooltip-html-unsafe="{{tooltipRightContent()}}">',
            '<span class="glyphicon glyphicon-chevron-right"></span>',
          '</button>',
        '</div>'
        ].join(''),

      link: function($scope, $el) {

        $scope.toTheLeftHTML = '';
        $scope.toTheRightHTML = '';

        $scope.disableLeft = function() {
          return !$scope.toTheLeftHTML;
        };

        $scope.disableRight = function() {
          return !$scope.toTheRightHTML;
        };

        $scope.tooltipLeftContent = function() {
          return $scope.showTooltips ? $scope.toTheLeftHTML : '';
        };

        $scope.tooltipRightContent = function() {
          return $scope.showTooltips ? $scope.toTheRightHTML : '';
        };

        $scope.tooltipLeftDirection = function() {
          return $scope.tooltipLeft ? $scope.tooltipLeft : 'bottom';
        };

        $scope.tooltipRightDirection = function() {
          return $scope.tooltipRight ? $scope.tooltipRight : 'bottom';
        };

        //select the innermost child that isn't a span
        //this way we cover getting <tab-heading> and <tab heading=''>
        //but leave other markup out of it, unless it's a span (commonly an icon)
        var selector = '*:not(:has("*:not(span)"))';

        $scope.getSelector = function() {
          return $scope.tooltipTextSelector ? $scope.tooltipTextSelector : selector;
        };

        $scope.toTheLeft = function() {
          if(!$scope.tabContainer) return;

          var nodes = [];
          $scope.tabContainer.find($scope.getSelector()).each(function(index, node) {

            var nodeObj = $(node);
            var nodeContainer = nodeObj.parentsUntil('ul');

            if(nodeContainer.offset().left > $scope.baseLeft) return;

            var html = nodeObj.html().trim();
            if(html) {
              nodes.push(html);
            }

          });

          $scope.toTheLeftHTML = nodes.join('<br>');
        };

        $scope.toTheRight = function() {
          if(!$scope.tabContainer) return;

          var nodes = [];
          $scope.tabContainer.find($scope.getSelector()).each(function(index, node) {

            var nodeObj = $(node);
            var nodeContainer = nodeObj.parentsUntil('ul');
            var nodeWidth = nodeContainer.offset().left;

            if(nodeWidth < $scope.tabWidth + $scope.baseLeft) return;

            var html = nodeObj.html().trim();
            if(html) {
              nodes.push(html);
            }

          });

          $scope.toTheRightHTML = nodes.join('<br>');
        };

        $scope.recalcSides = function() {
          $scope.toTheLeft();
          $scope.toTheRight();
        };

        var generateScrollFunction = function(el, offset) {
          return function() {
            el.scrollLeft += offset;
            $scope.recalcSides();
          };
        };

        var init = function() {
          var $leftNav = $el.find('.left-nav-button');
          var $rightNav = $el.find('.right-nav-button');
          var $tabs = $scope.tabContainer = $el.find('.spacer').find('ul.nav.nav-tabs');

          $scope.baseLeft = $el.offset().left;

          var tabContainerWidth = $scope.tabContainerWidth = $tabs[0].scrollWidth;
          var tabWidth = $scope.tabWidth = $tabs.width();
          var tabScrollWidth = tabWidth / 6;
          var realTabs = $tabs[0];

          $scope.hideButtons = tabContainerWidth === tabWidth;

          bindHoldFunctionTo($leftNav, generateScrollFunction(realTabs, -tabScrollWidth));
          bindHoldFunctionTo($rightNav, generateScrollFunction(realTabs, tabScrollWidth));

          $scope.recalcSides();
        };

        var initAndApply = function() {
          init();
          $scope.$apply();
        };

        //hello my friend jake weary
        $(window).on('resize', initAndApply);

        //even if one doesn't exist, we can still initialize w/ this
        $scope.$watch(function(){return $scope.watchExpression;}, function() {
          $timeout(initAndApply, 0);
        }, true);

      }
    };
}]);
