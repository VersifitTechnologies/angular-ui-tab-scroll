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
    }

    var unbindFunctions = function(el, cache) {
      if(!cache) return;
      el.off('mousedown', cache.mouseDown);
      el.off('mouseup', cache.mouseUp);
    };

    var bindHoldFunctionTo = function(element, fn) {

      var isHolding = false;

      var mouseDown = function() {
        isHolding = true;

        fn();

        timeoutId = $interval(function() {
          if(isHolding) {
            fn();

            if($(element).is(":disabled")) {
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

      return {mouseDown: mouseDown, mouseUp: mouseUp};

    };

    return {
      restrict: 'AE',
      transclude: true,
      scope: {
         showTooltips: "="
      },
      template: [
        '<div class="ui-tabs-scrollable">',
          '<button ng-hide="hideButtons" ng-disabled="disableLeft()" class="btn nav-button left-nav-button" tooltip-placement="bottom" tooltip-html-unsafe="{{tooltipLeftContent()}}">',
            '<span class="glyphicon glyphicon-chevron-left"></span>',
          '</button>',
          '<div class="spacer" ng-class="{\'hidden-buttons\': hideButtons}" ng-transclude></div>',
          '<button ng-hide="hideButtons" ng-disabled="disableRight()" class="btn nav-button right-nav-button" tooltip-placement="bottom" tooltip-html-unsafe="{{tooltipRightContent()}}">',
            '<span class="glyphicon glyphicon-chevron-right"></span>',
          '</button>',
        '</div>'
        ].join(''),
      link: function($scope, $el) {

        $scope.currentOffset = 0;
        $scope.leftFunction = null;
        $scope.rightFunction = null;

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

        //select the innermost child that isn't a span
        //this way we cover getting <tab-heading> and <tab heading=''>
        //but leave other markup out of it, unless it's a span (commonly an icon)
        var selector = '*:not(:has("*:not(span)"))';

        $scope.toTheLeft = function() {
          if(!$scope.tabContainer) return;
          var nodes = [];
          $scope.tabContainer.find(selector).each(function(index, node) {
            var nodeObj = $(node);
            var nodeContainer = nodeObj.parentsUntil("ul");

            if(nodeContainer.offset().left > 0) return;

            nodes.push(nodeObj.html());
          });
          $scope.toTheLeftHTML = nodes.join('<br>');
        };

        $scope.toTheRight = function() {
          if(!$scope.tabContainer) return;
          var nodes = [];
          $scope.tabContainer.find(selector).each(function(index, node) {
            var nodeObj = $(node);
            var nodeContainer = nodeObj.parentsUntil("ul");

            var nodeWidth = nodeContainer.offset().left;
            
            if(nodeWidth < $scope.tabWidth) return;

            nodes.push(nodeObj.html());
          });
          $scope.toTheRightHTML = nodes.join('<br>');
        };

        $scope.recalcSides = function() {
          $scope.toTheLeft();
          $scope.toTheRight();
        };

        var generateScrollFunction = function(el, offset) {
          return function() {
            $scope.currentOffset = Math.min($scope.tabContainerWidth, Math.max(0, el.scrollLeft += offset));
            $scope.recalcSides();
          };
        };

        var init = function() {
          var $leftNav = $el.find(".left-nav-button");
          var $rightNav = $el.find(".right-nav-button");
          var $tabs = $scope.tabContainer = $el.find(".spacer").find("ul.nav.nav-tabs");

          var tabContainerWidth = $scope.tabContainerWidth = $tabs[0].scrollWidth;
          var tabWidth = $scope.tabWidth = $tabs.width();
          var tabScrollWidth = tabWidth / 6;
          var realTabs = $tabs[0];

          $scope.hideButtons = tabContainerWidth === tabWidth;

          $scope.leftFunction = generateScrollFunction(realTabs, -tabScrollWidth);
          $scope.rightfunction = generateScrollFunction(realTabs, tabScrollWidth);

          unbindFunctions($leftNav, $scope.leftFunctionCache);
          unbindFunctions($rightNav, $scope.rightFunctionCache);

          $scope.leftFunctionCache = bindHoldFunctionTo($leftNav, $scope.leftFunction);
          $scope.rightfunctionCache = bindHoldFunctionTo($rightNav, $scope.rightfunction);

          $scope.recalcSides();
        };

        $timeout(init, 0);

        $(window).on('resize', function() {
          init();
          $scope.$apply();
        });

      }
    };
}]);
