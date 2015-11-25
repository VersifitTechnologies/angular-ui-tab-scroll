/*
 * angular-ui-tab-scroll
 * https://github.com/VersifitTechnologies/angular-ui-tab-scroll
 *
 * Version: 1.0.0
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

        var timeoutId = null;

        var cancelId = function() {
          if(timeoutId) {
            $interval.cancel(timeoutId);
            timeoutId = null;
          }
        };

        var bindHoldFunctionTo = function(element, fn) {

          //get rid of the previous scroll function
          element.off('mousedown', mouseDown);
          element.off('mouseup', mouseUp);

          var isHolding = false;

          var mouseDown = function() {
            isHolding = true;

            fn();

            timeoutId = $interval(function() {
              if(isHolding) {
                fn();

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
                $timeout(function(){$scope.init()});
              }
            };
          }],

          template: [
            '<div class="ui-tabs-scrollable">',
            '<button type="button" ng-hide="hideButtons" ng-disabled="disableLeft()" class="btn nav-button left-nav-button" tooltip-placement="{{tooltipLeftDirection()}}" tooltip-html="tooltipLeftHtml">',
            '</button>',
            '<div class="spacer" ng-class="{\'hidden-buttons\': hideButtons}" ng-transclude></div>',
            '<button type="button" ng-hide="hideButtons" ng-disabled="disableRight()" class="btn nav-button right-nav-button" tooltip-placement="{{tooltipRightDirection()}}" tooltip-html="tooltipRightHtml">',
            '</button>',
            '</div>'
          ].join(''),

          link: function($scope, $el) {

            $scope.tooltipRightHtml = '';
            $scope.tooltipLeftHtml = '';
            var toTheLeftHTML = '';
            var toTheRightHTML = '';

            var showTooltips = angular.isDefined($scope.showTooltips)? $scope.showTooltips : scrollableTabsetConfig.showTooltips;

            $scope.disableLeft = function() {
              return !toTheLeftHTML;
            };

            $scope.disableRight = function() {
              return !toTheRightHTML;
            };

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

            $scope.offsetLeft = function (element) {
              return element[0].getBoundingClientRect().left + window.pageXOffset - document.documentElement.clientLeft;
            };

            $scope.toTheLeft = function() {
              if(!$scope.tabContainer) return;

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
            };

            $scope.toTheRight = function() {
              if(!$scope.tabContainer) return;

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

            $scope.init = function() {
              var leftNav = angular.element($el[0].querySelector('.left-nav-button'));
              var rightNav = angular.element($el[0].querySelector('.right-nav-button'));
              var tabs = $scope.tabContainer = $el[0].querySelector('.spacer').querySelector('ul.nav.nav-tabs');

              $scope.baseLeft = $scope.offsetLeft($el);

              var tabContainerWidth = $scope.tabContainerWidth = tabs.scrollWidth;
              var tabWidth = $scope.tabWidth = tabs.getBoundingClientRect().width;
              var realTabs = tabs;

              $scope.hideButtons = tabContainerWidth === tabWidth;

              bindHoldFunctionTo(leftNav, generateScrollFunction(realTabs, -100));
              bindHoldFunctionTo(rightNav, generateScrollFunction(realTabs, 100));

              $scope.recalcSides();
            };

            var initAndApply = function() {
              $scope.init();
              $scope.$apply();
            };

            var w = angular.element($window);
            w.bind('resize', initAndApply);

            //we initialize by watching changes on the inner tabset's tabs collection
            var tabsetElem = angular.element($el[0].querySelector( 'div.spacer' )).children()[0];//get the wrapped 'tabset'
            var $tabsetElem = angular.element(tabsetElem);
            var tabsetScope = $tabsetElem.isolateScope() || $tabsetElem.scope();// get the tabset's scope to access to tabs collection

            $scope.$watch(function(){
              return $scope.tabs;
            }, function(newValues, oldValues){
              $timeout(initAndApply, 0);
            }, true);

          }
        };
      }]);
