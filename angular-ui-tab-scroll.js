/*
 * angular-ui-tab-scroll
 * https://github.com/VersifitTechnologies/angular-ui-tab-scroll
 *
 * Version: 2.0.0
 * License: MIT
 */

angular.module('ui.tab.scroll', [])
    .provider('scrollableTabsetConfig', function(){

          //the default options
          var defaultConfig = {
            showDropDown: true,
            showTooltips: true,
            tooltipLeftPlacement: 'right',
            tooltipRightPlacement: 'left',
            scrollBy: '50',
            autoRecalculate: false
          };

          var config = angular.extend({}, defaultConfig);

          return {
            setShowDropDown : function(value){
              config.showDropDown = (value == true);
            },
            setShowTooltips : function(value){
              config.showTooltips = (value == true);
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
            setAutoRecalculate : function(value){
              config.autoRecalculate = (value == true);
            },
            $get: function(){
              return {
                showDropDown: config.showDropDown,
                showTooltips: config.showTooltips,
                tooltipLeftPlacement: config.tooltipLeftPlacement,
                tooltipRightPlacement: config.tooltipRightPlacement,
                scrollBy: config.scrollBy,
                autoRecalculate: config.autoRecalculate
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
            showDropDown: '@',
            showTooltips: '@',
            tooltipLeftPlacement: '@',
            tooltipRightPlacement: '@',
            scrollBy: '@',
            autoRecalculate: '@',
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
            '<div class="ui-tabs-scrollable" ng-class="{\'show-drop-down\': !hideDropDown}">',
              '<button type="button" ng-hide="hideButtons" ng-disabled="disableLeft" class="btn nav-button left-nav-button" tooltip-placement="{{tooltipLeftDirection}}" tooltip-html="tooltipLeftHtml"></button>',
              '<div class="spacer" ng-class="{\'hidden-buttons\': hideButtons}" ng-transclude></div>',
              '<button type="button" ng-hide="hideButtons" ng-disabled="disableRight" class="btn nav-button right-nav-button" tooltip-placement="{{tooltipRightDirection}}" tooltip-html="tooltipRightHtml"></button>',
              '<div class="btn-group" dropdown is-open="isDropDownOpen" ng-hide="hideDropDown">',
                '<button type="button" class="btn" dropdown-toggle></button>',
                '<ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="single-button">',
                  '<li role="menuitem" ng-repeat="tab in dropdownTabs" ng-class="{\'disabled\': tab.disabled}" ng-click="activateTab(tab)">',
                    '<a href="#"><span class="dropDownTabActiveMark" ng-style="{\'visibility\': tab.active?\'visible\':\'hidden\'}"></span>{{tab.tabScrollTitle}}</a>',
                  '</li>',
                '</ul>',
              '</div>',
            '</div>'
          ].join(''),

          link: function($scope, $el) {

            $scope.dropdownTabs = [];
            $scope.isDropDownOpen = false;
            $scope.hideButtons = true;
            $scope.hideDropDown = true;
            $scope.tooltipRightHtml = '';
            $scope.tooltipLeftHtml = '';
            $scope.disableLeft = true;
            $scope.disableRight = true;
            $scope.tooltipLeftDirection = $scope.tooltipLeftPlacement ? $scope.tooltipLeftPlacement : scrollableTabsetConfig.tooltipLeftPlacement;
            $scope.tooltipRightDirection =  $scope.tooltipRightPlacement ? $scope.tooltipRightPlacement : scrollableTabsetConfig.tooltipRightPlacement;

            var mouseDownInterval = null;
            var showDropDown = $scope.showDropDown ? $scope.showDropDown === 'true' : scrollableTabsetConfig.showDropDown;
            var showTooltips = $scope.showTooltips ? $scope.showTooltips === 'true' : scrollableTabsetConfig.showTooltips == true;

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

            $scope.activateTab = function(tab) {
              if(tab.disabled)return;
              tab.active = true;
              $timeout(function () {
                $scope.scrollTabIntoView();
              });
            }

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

                var rightPosition = parseInt(tab.getBoundingClientRect().left + tab.getBoundingClientRect().width - $scope.tabContainer.getBoundingClientRect().left);
                var leftPosition = tab.getBoundingClientRect().left - $scope.tabContainer.getBoundingClientRect().left;
                var heading = tab.getAttribute("data-tabScrollHeading");
                var ignore = tab.getAttribute("data-tabScrollIgnore");

                if(rightPosition > $scope.tabContainer.offsetWidth && !ignore ) {
                  if(heading) {
                    rightTooltips.push(heading)
                  } else if (tab.textContent)rightTooltips.push(tab.textContent);
                }

                if (leftPosition < 0 && !ignore ) {
                  if(heading) {
                    leftTooltips.push(heading)
                  } else if (tab.textContent)leftTooltips.push(tab.textContent);
                }

              });

              var rightTooltipsHtml = rightTooltips.join('<br>');
              $scope.tooltipRightHtml = $sce.trustAsHtml(rightTooltipsHtml);

              var leftTooltipsHtml = leftTooltips.join('<br>');
              $scope.tooltipLeftHtml = $sce.trustAsHtml(leftTooltipsHtml);
            };

            $scope.scrollTabIntoView = function(arg){
              if(!$scope.tabContainer || $scope.hideButtons)return;

              var argInt = parseInt(arg);

              if(argInt) { // scroll tab index into view
                var allTabs = $scope.tabContainer.querySelectorAll('li');
                if(allTabs.length > argInt) { // only if its really exist
                  allTabs[argInt].scrollIntoView();
                }
              }

              else { // scroll selected tab into view
                var activeTab = $scope.tabContainer.querySelector('li.active');
                if(activeTab) {
                  activeTab.scrollIntoView();
                }
              }

              $scope.reCalcAll();
            };

            // init is called only once!
            $scope.init = function() {
              $scope.tabContainer = $el[0].querySelector('.spacer ul.nav-tabs');
              if(!$scope.tabContainer)return;

              var autoRecalc = $scope.autoRecalculate ? $scope.autoRecalculate === 'true' : scrollableTabsetConfig.autoRecalculate;
              if(autoRecalc) {
                var tabsetElement = angular.element($el[0].querySelector('.spacer div'));
                $scope.$watchCollection(
                    function () {
                      return tabsetElement.isolateScope() ? tabsetElement.isolateScope().tabs : false;
                    },
                    function (newValues, oldValues) {
                      $timeout(function () {
                        $scope.reCalcAll()
                      });
                    }
                );
              }

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

              $scope.hideButtons = $scope.tabContainer.scrollWidth <= $scope.tabContainer.offsetWidth;
              $scope.hideDropDown = showDropDown ? $scope.hideButtons : true;

              if(!$scope.hideButtons) {

                if(!$scope.hideDropDown) {
                  var allTabs = $scope.tabContainer.querySelectorAll('li');
                  $scope.dropdownTabs = [];
                  angular.forEach(allTabs, function (tab) {
                    var ignore = tab.getAttribute("data-tabScrollIgnore");
                    if(!ignore){
                      var heading = tab.getAttribute("data-tabScrollHeading");
                      var tabScope = angular.element(tab).isolateScope();
                      //push new field to use as title in the drop down.
                      tabScope.tabScrollTitle = heading ? heading : tabScope.headingElement.textContent;
                      $scope.dropdownTabs.push(tabScope);
                    }
                  });
                }

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

