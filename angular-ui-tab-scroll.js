/*
 * angular-ui-tab-scroll
 * https://github.com/VersifitTechnologies/angular-ui-tab-scroll
 *
 * Version: 2.2.3
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
            api: '=?'
          },

          template: [
            '<div class="ui-tabs-scrollable" ng-class="{\'show-drop-down\': !hideDropDown}">',
              '<button type="button" ng-mousedown="scrollButtonDown(\'left\', $event)" ng-mouseup="scrollButtonUp()" ng-hide="hideButtons"' +
              ' ng-disabled="disableLeft" class="btn nav-button left-nav-button"' +
              ' tooltip-placement="{{tooltipLeftDirection}}" uib-tooltip-html="tooltipLeftHtml"></button>',
              '<div class="spacer" ng-class="{\'hidden-buttons\': hideButtons}" ng-transclude></div>',
              '<button type="button" ng-mousedown="scrollButtonDown(\'right\', $event)" ng-mouseup="scrollButtonUp()" ng-hide="hideButtons"' +
              ' ng-disabled="disableRight" class="btn nav-button right-nav-button"' +
              ' tooltip-placement="{{tooltipRightDirection}}" uib-tooltip-html="tooltipRightHtml"></button>',
              '<div class="btn-group" uib-dropdown dropdown-append-to-body ng-hide="hideDropDown">',
                '<button type="button" class="btn" uib-dropdown-toggle></button>',
                '<ul class="dropdown-menu dropdown-menu-right" uib-dropdown-menu role="menu">',
                  '<li role="menuitem" ng-repeat="tab in dropdownTabs" ng-class="{\'disabled\': tab.disabled}" ng-click="activateTab(tab)">',
                    '<a href><span class="dropDownTabActiveMark" ng-style="{\'visibility\': tab.active?\'visible\':\'hidden\'}"></span>{{tab.tabScrollTitle}}</a>',
                  '</li>',
                '</ul>',
              '</div>',
            '</div>'
          ].join(''),

          link: function($scope, $el) {

            $scope.dropdownTabs = [];
            $scope.hideButtons = true;
            $scope.hideDropDown = true;
            $scope.tooltipRightHtml = '';
            $scope.tooltipLeftHtml = '';
            $scope.disableLeft = true;
            $scope.disableRight = true;
            $scope.tooltipLeftDirection = $scope.tooltipLeftPlacement ? $scope.tooltipLeftPlacement : scrollableTabsetConfig.tooltipLeftPlacement;
            $scope.tooltipRightDirection =  $scope.tooltipRightPlacement ? $scope.tooltipRightPlacement : scrollableTabsetConfig.tooltipRightPlacement;
            $scope.mouseDownInterval = null;
            $scope.isHolding = false;
            $scope.winResizeTimeout;
            $scope.userShowDropDown = $scope.showDropDown ? $scope.showDropDown === 'true' : scrollableTabsetConfig.showDropDown;
            $scope.userShowTooltips = $scope.showTooltips ? $scope.showTooltips === 'true' : scrollableTabsetConfig.showTooltips == true;
            $scope.scrollByPixels = parseInt($scope.scrollBy ? $scope.scrollBy : scrollableTabsetConfig.scrollBy);

            $scope.api = {
              doRecalculate: function(){
                $timeout(function(){$scope.reCalcAll()});
              },

              scrollTabIntoView: function(arg){
                $timeout(function(){$scope.scrollTabIntoView(arg)});
              }
            };

            $scope.scrollTo = function(element, change, duration, callback, isLinear) {
              var start = element.scrollLeft;
              var increment = 20;
              var position = 0;

              var animateScroll = function(elapsedTime) {
                elapsedTime += increment;
                if(isLinear === true) {
                  position = $scope.linearTween(elapsedTime, start, change, duration);
                } else {
                  position = $scope.easeInOutQuad(elapsedTime, start, change, duration);
                }
                element.scrollLeft = position;
                if (elapsedTime < duration) {
                  setTimeout(function() {
                    animateScroll(elapsedTime);
                  }, increment);
                }else{
                  callback();
                }
              };

              animateScroll(0);
            }

            $scope.linearTween = function (currentTime, start, change, duration) {
              return change * currentTime / duration + start;
            };

            $scope.easeInOutQuad = function(currentTime, start, change, duration) {
              currentTime /= duration / 2;
              if (currentTime < 1) {
                return change / 2 * currentTime * currentTime + start;
              }
              currentTime --;
              return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
            }

            $scope.onWindowResize = function() {
              // delay for a bit to avoid running lots of times.
              clearTimeout($scope.winResizeTimeout);
              $scope.winResizeTimeout = setTimeout(function(){
                $scope.reCalcAll();
                $scope.$apply();
              }, 250);
            };

            $scope.cancelMouseDownInterval = function() {
              $scope.isHolding = false;

              if($scope.mouseDownInterval) {
                $interval.cancel($scope.mouseDownInterval);
                $scope.mouseDownInterval = null;
              }
            };

            $scope.scrollButtonDown = function(direction, event) {
              event.stopPropagation();
              $scope.isHolding = true;

              var realScroll = direction === 'left' ? 0 - $scope.scrollByPixels : $scope.scrollByPixels;
              $scope.scrollTo($scope.tabContainer, realScroll, 150, function(){
                $timeout(function(){
                  $scope.reCalcSides();
                });
              }, true);

              $scope.mouseDownInterval = $interval(function() {

                if($scope.isHolding) {
                  $scope.scrollTo($scope.tabContainer, realScroll, 150, function(){
                    $timeout(function(){
                      $scope.reCalcSides();
                    });
                  }, true);

                  if(event.target.disabled) {
                    $scope.cancelMouseDownInterval();
                  }
                }
              }, 100);
            }

            $scope.scrollButtonUp = function() {
              $scope.cancelMouseDownInterval();
            }

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

              if($scope.userShowTooltips){
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
              var tabToScroll;

              // first we find the tab element.
              if(argInt) { // scroll tab index into view
                var allTabs = $scope.tabContainer.querySelectorAll('li');
                if(allTabs.length > argInt) { // only if its really exist
                  tabToScroll = allTabs[argInt];
                }
              } else { // scroll selected tab into view
                var activeTab = $scope.tabContainer.querySelector('li.active');
                if(activeTab) {
                  tabToScroll = activeTab;
                }
              }

              // now let's scroll it into view.
              if(tabToScroll) {
                var rightPosition = parseInt(tabToScroll.getBoundingClientRect().left + tabToScroll.getBoundingClientRect().width - $scope.tabContainer.getBoundingClientRect().left);
                var leftPosition = tabToScroll.getBoundingClientRect().left - $scope.tabContainer.getBoundingClientRect().left;
                if (leftPosition < 0) {
                  var dif = leftPosition - 20;
                  $scope.scrollTo($scope.tabContainer, dif, 700, function(){
                    $timeout(function(){
                      $scope.reCalcSides();
                    });
                  });
                } else if(rightPosition > $scope.tabContainer.offsetWidth){
                  var dif = rightPosition - $scope.tabContainer.offsetWidth + 20;
                  $scope.scrollTo($scope.tabContainer, dif, 700, function(){
                    $timeout(function(){
                      $scope.reCalcSides();
                    });
                  });
                }
              }
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
                    function () {
                      $timeout(function () {
                        $scope.reCalcAll()
                      });
                    }
                );
              }

              $scope.reCalcAll();

              // attaching event to window resize.
              angular.element($window).on('resize', $scope.onWindowResize);
            };

            // re-calculate if the scroll buttons are needed, than call re-calculate for both buttons.
            $scope.reCalcAll = function() {
              if(!$scope.tabContainer)return;

              $scope.hideButtons = $scope.tabContainer.scrollWidth <= $scope.tabContainer.offsetWidth;
              $scope.hideDropDown = $scope.userShowDropDown ? $scope.hideButtons : true;

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
                      tabScope.tabScrollTitle = heading ? heading : tab.textContent.trim();
                      $scope.dropdownTabs.push(tabScope);
                    }
                  });
                }

                $scope.reCalcSides();
              }
            };

            // this is how we init for the first time.
            $timeout(function(){
              $scope.init();
            });

            // when scope destroyed
            $scope.$on('$destroy', function () {
              angular.element($window).off('resize', $scope.onWindowResize);
            });

          }
        };
      }]);
