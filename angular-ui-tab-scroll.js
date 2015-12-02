/*
 * angular-ui-tab-scroll
 * https://github.com/VersifitTechnologies/angular-ui-tab-scroll
 *
 * Version: 1.1.2
 * License: MIT
 */

angular.module('ui.tab.scroll', [])
    .provider('scrollableTabsetConfig', function(){

          //the default options
          var defaultConfig = {
            showTooltips: true,

            tooltipLeftPlacement: 'right',
            tooltipRightPlacement: 'left',

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
            setTooltipLeftPlacement : function(value){
              config.tooltipLeftPlacement = value;
            },
            setTooltipRightPlacement : function(value){
              config.tooltipRightPlacement = value;
            },
            setTooltipTextSelector : function(value){
              config.tooltipTextSelector = value;
            },
            $get: function(){
              return {
                showTooltips: config.showTooltips,
                tooltipLeftPlacement: config.tooltipLeftPlacement,
                tooltipRightPlacement: config.tooltipRightPlacement,
                tooltipTextSelector: config.tooltipTextSelector
              };
            }
          };
        }
    )
    .directive('scrollableTabset', [
      'scrollableTabsetConfig', '$window', '$interval', '$timeout','$sce',
      function(scrollableTabsetConfig, $window, $interval, $timeout, $sce) {

        return {
          restrict: 'AE',
          transclude: true,

          scope: {
            showTooltips: '@',
            tooltipLeftPlacement: '@',
            tooltipRightPlacement: '@',
            tooltipTextSelector: '@',
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
            '<button type="button" ng-hide="hideButtons" ng-disabled="disableLeft" class="btn nav-button left-nav-button" tooltip-placement="{{tooltipLeftDirection}}" tooltip-html="tooltipLeftHtml">',
            '</button>',
            '<div class="spacer" ng-class="{\'hidden-buttons\': hideButtons}" ng-transclude></div>',
            '<button type="button" ng-hide="hideButtons" ng-disabled="disableRight" class="btn nav-button right-nav-button" tooltip-placement="{{tooltipRightDirection}}" tooltip-html="tooltipRightHtml">',
            '</button>',
            '</div>'
          ].join(''),

          link: function($scope, $el) {

            $scope.tooltipRightHtml = '';
            $scope.tooltipLeftHtml = '';
            $scope.disableLeft = true;
            $scope.disableRight = true;
            $scope.tooltipLeftDirection = $scope.tooltipLeftPlacement ? $scope.tooltipLeftPlacement : scrollableTabsetConfig.tooltipLeftPlacement;
            $scope.tooltipRightDirection =  $scope.tooltipRightPlacement ? $scope.tooltipRightPlacement : scrollableTabsetConfig.tooltipRightPlacement;

            var mouseDownInterval = null;
            var showTooltips = $scope.showTooltips ? $scope.showTooltips : scrollableTabsetConfig.showTooltips;

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

            var findStringForTooltip = function(node) {
              var selector = $scope.tooltipTextSelector ? $scope.tooltipTextSelector : scrollableTabsetConfig.tooltipTextSelector;
              var nodeSelector = node.querySelector(selector);
              if(nodeSelector) {
                var html = angular.element(nodeSelector).html().trim();
                if (html) {
                  return html.split(' ').join('&nbsp;');
                }
              }
            };

            var onWindowResize = function() {
              $scope.reCalcAll();
              $scope.$apply();
            };

            var generateScrollFunction = function(el, offset) {
              return function() {
                el.scrollLeft += offset;
                $scope.reCalcSides();
              };
            };

            $scope.reCalcToTheLeft = function() {
              if(!$scope.tabContainer || $scope.hideButtons)return;

              var allTooltips = [];
              var allTabs = $scope.tabContainer.querySelectorAll('li');
              angular.forEach(allTabs, function(node) {

                var leftPosition = node.getBoundingClientRect().left - $scope.tabContainer.getBoundingClientRect().left;

                if (leftPosition >= 0 ) return;

                var nodeString = findStringForTooltip(node);
                if(nodeString)allTooltips.push(nodeString);

              });

              var tooltipsHtml = allTooltips.join('<br>');
              $scope.tooltipLeftHtml = showTooltips ? $sce.trustAsHtml(tooltipsHtml) : '';
              $scope.disableLeft = !tooltipsHtml;
            };

            $scope.reCalcToTheRight = function() {
              if(!$scope.tabContainer || $scope.hideButtons)return;

              var allTooltips = [];

              var allTabs = $scope.tabContainer.querySelectorAll('li');
              angular.forEach(allTabs, function(node) {

                var leftPosition = parseInt(node.getBoundingClientRect().left + node.getBoundingClientRect().width - $scope.tabContainer.getBoundingClientRect().left);
                var tabsWidth = $scope.tabContainer.getBoundingClientRect().width;
                if(leftPosition <= tabsWidth ) return;

                var nodeString = findStringForTooltip(node);
                if(nodeString)allTooltips.push(nodeString);

              });

              var tooltipsHtml = allTooltips.join('<br>');
              $scope.tooltipRightHtml = showTooltips ? $sce.trustAsHtml(tooltipsHtml) : '';
              $scope.disableRight = !tooltipsHtml;
            };

            $scope.reCalcSides = function() {
              if(!$scope.tabContainer || $scope.hideButtons)return;
              $scope.reCalcToTheLeft();
              $scope.reCalcToTheRight();
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

