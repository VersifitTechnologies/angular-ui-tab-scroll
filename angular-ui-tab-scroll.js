/*
 * angular-ui-tab-scroll
 * https://github.com/VersifitTechnologies/angular-ui-tab-scroll
 *
 * Version: 1.2.5
 * License: MIT
 */

angular.module('ui.tab.scroll', [])
    .provider('scrollableTabsetConfig', function(){

          //the default options
          var defaultConfig = {
            showTooltips: true,
            tooltipLeftPlacement: 'right',
            tooltipRightPlacement: 'left',
            scrollBy: '50',

            //select the innermost child that isn't a span
            //this way we cover getting <tab-heading> and <tab heading=''>
            //but leave other markup out of it, unless it's a span (commonly an icon)
            tabHeaderSelector: 'tab-heading'
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
            setScrollBy : function(value){
              config.scrollBy = value;
            },
            setTabHeaderSelector : function(value){
              config.tabHeaderSelector = value;
            },
            $get: function(){
              return {
                showTooltips: config.showTooltips,
                tooltipLeftPlacement: config.tooltipLeftPlacement,
                tooltipRightPlacement: config.tooltipRightPlacement,
                scrollBy: config.scrollBy,
                tabHeaderSelector: config.tabHeaderSelector
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
            scrollBy: '@',
            tabHeaderSelector: '@',
            api: '='
          },

          controller: ['$scope', '$timeout', function($scope, $timeout) {
            $scope.api = {
              doRecalculate: function(){
                $timeout(function(){$scope.reCalcAll()});
              },

              scrollTabIntoView: function(arg){
                $timeout(function(){$scope.scrollTabIntoView(arg)});
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

            $scope.hideButtons = true;
            $scope.tooltipRightHtml = '';
            $scope.tooltipLeftHtml = '';
            $scope.disableLeft = true;
            $scope.disableRight = true;
            $scope.tooltipLeftDirection = $scope.tooltipLeftPlacement ? $scope.tooltipLeftPlacement : scrollableTabsetConfig.tooltipLeftPlacement;
            $scope.tooltipRightDirection =  $scope.tooltipRightPlacement ? $scope.tooltipRightPlacement : scrollableTabsetConfig.tooltipRightPlacement;

            var mouseDownInterval = null;
            var showTooltips = $scope.showTooltips ? $scope.showTooltips === 'true' : scrollableTabsetConfig.showTooltips;

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

            var getTabHeaderFromTab = function(node) {
              var selector = $scope.tabHeaderSelector ? $scope.tabHeaderSelector : scrollableTabsetConfig.tabHeaderSelector;
              var nodeSelector = node.querySelector(selector);
              if(nodeSelector) {
                var html = angular.element(nodeSelector).html().trim();
                if (html) {
                  return html;
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

            $scope.reCalcSides = function() {
              if(!$scope.tabContainer || $scope.hideButtons)return;
              $scope.disableRight = $scope.tabContainer.scrollLeft >= $scope.tabContainer.scrollWidth - $scope.tabContainer.offsetWidth;
              $scope.disableLeft = $scope.tabContainer.scrollLeft <= 0;

              if(showTooltips){
                $scope.reCalcTooltips();
              }
            };

            $scope.reCalcTooltips = function(){
              if(!$scope.tabContainer || $scope.hideButtons)return;
              var rightTooltips = [];
              var leftTooltips = [];

              var allTabs = $scope.tabContainer.querySelectorAll('li');
              angular.forEach(allTabs, function(tab) {
                var tabHeader = getTabHeaderFromTab(tab);

                var rightPosition = parseInt(tab.getBoundingClientRect().left + tab.getBoundingClientRect().width - $scope.tabContainer.getBoundingClientRect().left);
                var leftPosition = tab.getBoundingClientRect().left - $scope.tabContainer.getBoundingClientRect().left;

                if(rightPosition > $scope.tabContainer.offsetWidth ) {
                  if (tabHeader)rightTooltips.push(tabHeader.split(' ').join('&nbsp;'));
                }

                if (leftPosition < 0 ) {
                  if (tabHeader)leftTooltips.push(tabHeader.split(' ').join('&nbsp;'));
                }

              });

              var rightTooltipsHtml = rightTooltips.join('<br>');
              $scope.tooltipRightHtml = $sce.trustAsHtml(rightTooltipsHtml);

              var leftTooltipsHtml = leftTooltips.join('<br>');
              $scope.tooltipLeftHtml = $sce.trustAsHtml(leftTooltipsHtml);
            };

            $scope.scrollTabIntoView = function(arg){

              var argInt = parseInt(arg);

              if(argInt) { // scroll tab index into view
                var allTabs = $scope.tabContainer.querySelectorAll('li');
                if(allTabs.length > argInt) { // only if its really exist
                  $scope.tabContainer.scrollLeft = allTabs[argInt].offsetLeft - ($scope.tabContainer.clientWidth / 2) - 25;
                }
              }

              else { // scroll selected tab into view
                var activeTab = $scope.tabContainer.querySelector('li.active');
                $scope.tabContainer.scrollLeft = activeTab.offsetLeft - ($scope.tabContainer.clientWidth / 2) - 25;
              }

              $scope.reCalcAll();
            };

            // init is called only once!
            $scope.init = function() {
              $scope.tabContainer = $el[0].querySelector('.spacer').querySelector('ul.nav.nav-tabs');
              if(!$scope.tabContainer)return;

              var leftNav = angular.element($el[0].querySelector('.left-nav-button'));
              var rightNav = angular.element($el[0].querySelector('.right-nav-button'));

              var scrollByPixels = parseInt($scope.scrollBy ? $scope.scrollBy : scrollableTabsetConfig.scrollBy);
              bindHoldFunctionTo(leftNav, generateScrollFunction($scope.tabContainer, 0-scrollByPixels));
              bindHoldFunctionTo(rightNav, generateScrollFunction($scope.tabContainer, scrollByPixels));

              $scope.reCalcAll();
            };

            // re-calculate if the scroll buttons are needed, than call re-calculate for both buttons.
            $scope.reCalcAll = function() {
              if(!$scope.tabContainer)return;

              // combating whitespace with javascript.
              angular.forEach($scope.tabContainer.childNodes, function(node) {
                if(node.nodeType === 3 && !node.nodeValue.trim()
                    && node.nextElementSibling && node.nextElementSibling.tagName === "LI"){
                  node.parentNode.removeChild(node);
                }
              });

              $scope.hideButtons = $scope.tabContainer.scrollWidth <= $scope.tabContainer.offsetWidth;

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

