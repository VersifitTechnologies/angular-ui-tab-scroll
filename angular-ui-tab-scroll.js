/*
 * angular-ui-tab-scroll
 * https://github.com/VersifitTechnologies/angular-ui-tab-scroll
 *
 * Version: 1.1.0
 * License: MIT
 */

angular.module('ui.tab.scroll', [])
    .provider('scrollableTabsetConfig', function(){

          //the default options
          var defaultConfig = {
            showTooltips: true,

            tooltipLeft: 'bottom',
            tooltipRight: 'bottom',

            //select the innermost child that isn't a span
            //this way we cover getting <tab-heading> and <tab heading=''>
            //but leave other markup out of it, unless it's a span (commonly an icon)
            tooltipTextSelector: 'tab-heading'
          };

          var config = angular.extend({}, defaultConfig);

          return {
            setShowTooltips : function(value){
              config.showTooltips = value;
            },
            setTooltipLeft : function(value){
              config.tooltipLeft = value;
            },
            setTooltipRight : function(value){
              config.tooltipRight = value;
            },
            setTooltipTextSelector : function(value){
              config.tooltipTextSelector = value;
            },
            $get: function(){
              return {
                showTooltips: config.showTooltips,
                tooltipLeft: config.tooltipLeft,
                tooltipRight: config.tooltipRight,
                tooltipTextSelector: config.tooltipTextSelector
              };
            }
          };
        }
    )
    .directive('scrollableTabset', [
      'scrollableTabsetConfig', '$window', '$interval', '$timeout','$sce',
      function(scrollableTabsetConfig, $window, $interval, $timeout, $sce) {

        var mouseDownInterval = null;

        var cancelId = function() {
          if(mouseDownInterval) {
            $interval.cancel(mouseDownInterval);
            mouseDownInterval = null;
          }
        };

        var bindHoldFunctionTo = function(element, scrollFunc) {
          //get rid of the previous mouse events.
          element.off('mousedown', mouseDown);
          element.off('mouseup', mouseUp);

          var isHolding = false;

          var mouseDown = function() {
            isHolding = true;

            scrollFunc();

            mouseDownInterval = $interval(function() {
              if(isHolding) {
                scrollFunc();

                if(element[0].disabled) {
                  cancelId();
                }
              }
            }, 100);
          };

          var mouseUp = function() {
            isHolding = false;
            cancelId();
          };

          // attach mouse events.
          element.on('mousedown', mouseDown);
          element.on('mouseup', mouseUp);
        };

        return {
          restrict: 'AE',
          transclude: true,

          scope: {
            showTooltips: '=',
            tooltipLeft: '=',
            tooltipRight: '=',
            tooltipTextSelector: '=',
            api: '='
          },

          controller: ['$scope', '$timeout', function($scope, $timeout) {
            $scope.api = {
              doRecalculate: function(){
                $timeout(function(){$scope.reCalcAll()});
              }
            };
          }],

          template: [
            '<div class="ui-tabs-scrollable">',
            '<button type="button" ng-hide="hideButtons" ng-disabled="disableLeft" class="btn nav-button left-nav-button" tooltip-placement="{{tooltipLeftDirection()}}" tooltip-html="tooltipLeftHtml">',
            '</button>',
            '<div class="spacer" ng-class="{\'hidden-buttons\': hideButtons}" ng-transclude></div>',
            '<button type="button" ng-hide="hideButtons" ng-disabled="disableRight" class="btn nav-button right-nav-button" tooltip-placement="{{tooltipRightDirection()}}" tooltip-html="tooltipRightHtml">',
            '</button>',
            '</div>'
          ].join(''),

          link: function($scope, $el) {

            $scope.tooltipRightHtml = '';
            $scope.tooltipLeftHtml = '';
            $scope.disableLeft = true;
            $scope.disableRight = true;
            var toTheLeftHTML = '';
            var toTheRightHTML = '';

            var showTooltips = angular.isDefined($scope.showTooltips)? $scope.showTooltips : scrollableTabsetConfig.showTooltips;

            $scope.tooltipLeftDirection = function() {
              return $scope.tooltipLeft ? $scope.tooltipLeft : scrollableTabsetConfig.tooltipLeft;
            };

            $scope.tooltipRightDirection = function() {
              return $scope.tooltipRight ? $scope.tooltipRight : scrollableTabsetConfig.tooltipRight;
            };

            $scope.getSelector = function() {
              return $scope.tooltipTextSelector ? $scope.tooltipTextSelector : scrollableTabsetConfig.tooltipTextSelector;
            };

            $scope.parentsUntilTag = function (element, tag) {
              var nodeContainer = element.parent();
              while (nodeContainer[0].tagName.toLowerCase() !== tag) {
                nodeContainer = nodeContainer.parent();
              }
              return nodeContainer;
            };

            $scope.toTheLeft = function() {
              if(!$scope.tabContainer || $scope.hideButtons)return;

              var nodes = [];
              angular.forEach($scope.tabContainer.querySelectorAll($scope.getSelector()), function(node) {

                var nodeObj = angular.element(node);
                var listItem = $scope.parentsUntilTag(nodeObj, 'li');
                var leftPosition = listItem[0].getBoundingClientRect().left - $scope.tabContainer.getBoundingClientRect().left;

                if (leftPosition >= 0 ) return;

                var html = nodeObj.html().trim();
                if(html) {
                  nodes.push(html.replace(' ', '&nbsp;'));
                }

              });

              toTheLeftHTML = nodes.join('<br>');
              $scope.tooltipLeftHtml = showTooltips ? $sce.trustAsHtml(toTheLeftHTML) : '';
              $scope.disableLeft = !toTheLeftHTML;
            };

            $scope.toTheRight = function() {
              if(!$scope.tabContainer || $scope.hideButtons)return;

              var nodes = [];
              angular.forEach($scope.tabContainer.querySelectorAll($scope.getSelector()), function(node) {

                var nodeObj = angular.element(node);
                var listItem = $scope.parentsUntilTag(nodeObj, 'li');
                var leftPosition = parseInt(listItem[0].getBoundingClientRect().left + listItem[0].getBoundingClientRect().width - $scope.tabContainer.getBoundingClientRect().left);
                var tabsWidth = $scope.tabContainer.getBoundingClientRect().width;

                if(leftPosition <= tabsWidth ) return;

                var html = nodeObj.html().trim();
                if(html) {
                  nodes.push(html.replace(' ', '&nbsp;'));
                }

              });

              toTheRightHTML = nodes.join('<br>');
              $scope.tooltipRightHtml = showTooltips ? $sce.trustAsHtml(toTheRightHTML) : '';
              $scope.disableRight = !toTheRightHTML;
            };

            $scope.reCalcSides = function() {
              if(!$scope.tabContainer || $scope.hideButtons)return;
              $scope.toTheLeft();
              $scope.toTheRight();
            };

            var generateScrollFunction = function(el, offset) {
              return function() {
                el.scrollLeft += offset;
                $scope.reCalcSides();
              };
            };

            // init is called only once!
            $scope.init = function() {
              $scope.tabContainer = $el[0].querySelector('.spacer').querySelector('ul.nav.nav-tabs');
              if(!$scope.tabContainer)return;

              var leftNav = angular.element($el[0].querySelector('.left-nav-button'));
              var rightNav = angular.element($el[0].querySelector('.right-nav-button'));

              bindHoldFunctionTo(leftNav, generateScrollFunction($scope.tabContainer, -100));
              bindHoldFunctionTo(rightNav, generateScrollFunction($scope.tabContainer, 100));

              $scope.reCalcAll();
            };

            // re-calculate if the scroll buttons are needed, than call re-calculate for both buttons.
            $scope.reCalcAll = function() {
              if(!$scope.tabContainer)return;
              $scope.hideButtons = $scope.tabContainer.scrollWidth === $scope.tabContainer.getBoundingClientRect().width;

              if(!$scope.hideButtons) {
                $scope.reCalcSides();
              }
            };

            var onWindowResize = function() {
              $scope.reCalcAll();
              $scope.$apply();
            };

            // attaching event to window resize.
            angular.element($window).on('resize', onWindowResize);

            // this is how we init for the first time.
            $timeout(function(){
              $scope.init();
            });

            // when scope destroyed
            $scope.$on('$destroy', function () {
              angular.element($window).off('resize', onWindowResize);
            });

          }
        };
      }]);
