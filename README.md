angular-ui-tab-scroll
=====================

A scrollable tab plugin intended for scrolling UI Bootstrap [tabset](https://angular-ui.github.io/bootstrap/#/tabs).

Here is a working demo : http://plnkr.co/edit/YJNDaQ?p=preview

[![npm version](https://img.shields.io/npm/v/angular-ui-tab-scroll.svg?style=flat-square)](https://www.npmjs.com/package/angular-ui-tab-scroll)
[![npm downloads](https://img.shields.io/npm/dm/angular-ui-tab-scroll.svg?style=flat-square)](http://npm-stat.com/charts.html?package=angular-ui-tab-scroll&from=2015-01-01)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)

### Usage
* Include `angular-ui-tab-scroll.js` and `angular-ui-tab-scroll.css` in your page.
* Add `ui.tab.scroll` to your angular module dependencies.
* Wrap your `<tabset>` inside of `<scrollable-tabset>`, like so:

```html
<scrollable-tabset show-tooltips="true">
	<tabset>
		<tab ng-repeat="x in tabs">...</tab>
	</tabset>
</scrollable-tabset>
```

### Attributes
* `show-drop-down` - whether or not to show the drop-down for navigating the tabs, the drop-down reflects the selected tab and reflect if a tab is disabled.  default is `true`.
* `show-tooltips` - whether or not to show tooltips on the scroll buttons. default is `true`.
* `tooltip-left-placement` - which tooltip direction to use for the left button tooltip (bottom, top, left, right). default is `right`.
* `tooltip-right-placement` - which tooltip direction to use for the right button tooltip (bottom, top, left, right). default is `left`.
* `scroll-by` - the amount of pixels to offset upon each scroll. default is `50`.
* `auto-recalculate` - whether or not to watch the tabs collection for changes to initiate a re-calculation. default is `false`. important! see warning below
* `drop-down-header-template-url` - set custom header inside the drop-down. default is empty.

And additional attributes you can set on an individual tab:
* `data-tabScrollIgnore` - if there is 'data-tabScrollIgnore="true"' on a tab than it will not be shown in the drop-down.
* `data-tabScrollHeading` - put this on a tab and the value of it will be the text for this tab's tooltip and drop-down item.

Attributes can be directly set on each directive as DOM attributes

Example:
```html
<scrollable-tabset show-tooltips="true"
	               tooltip-left-placement="bottom"
	               scroll-by="150">
	<tabset>
		<tab ng-repeat="x in tabs">...</tab>
	</tabset>
</scrollable-tabset>
```

Or, they can be configured globally for all your `scrollable-tabset` directives, by using the **scrollableTabsetConfigProvider**, in the `config` section of your app.

Example:
```javascript
angular.module('yourApp', [])
	.config(['scrollableTabsetConfigProvider', function(scrollableTabsetConfigProvider){
		scrollableTabsetConfigProvider.setShowTooltips(false);
		scrollableTabsetConfigProvider.setScrollBy('20');
		//...set other properties here
	}]);
```

This way, you can keep the directive usage simple and consistent across all your html.

> **Important Notes:**
* Use `auto-recalculate` with caution! - when set to true a watcher is added to the collection of tabs, and watcher are costly on performance! it is better to call `doRecalculate()` when needed. use this option only on small applications.
* When an option is both defined at directive level and at config level, the value specified in the DOM takes precedence over the one from the config!.


### Api
there is an exposed api, with it you can call:
* `doRecalculate()` - force a re-calculation of the scroll, this will calculate if the scroll buttons are needed and which to enable\disable. usually needed after a tabs are added or removed.
* `scrollTabIntoView()` - scroll the selected tab into center of view. or if you want to scroll to a specific tab index:
* `scrollTabIntoView(number)` - scroll the tab index into center of view.

### Styling
you can use the default style by referencing `angular-ui-tab-scroll.css`, or you can chose to use the alternative customized flat style by referencing the supplied `angular-ui-tab-scroll-flat.css`.
both files are the result of a transpiled scss, which are also included in this package.

if you intend to have your own design i highly recommend you start with `angular-ui-tab-scroll-flat.scss` with it you can unleash the power of scss&css.

to change the icons on the buttons you simply need to override the relevant button's css with your own css

Example:
```css
.right-nav-button:before{
  font-family: 'Glyphicons Halflings';
  content: '\e080';
}
```
the drop-down can be given a class by using the `drop-down-class` property.

the drop-down menu can be given a class by using the `drop-down-menu-class` property.

the drop-down menu header can be given a class by using the `drop-down-header-class` property.

### Dependencies
* AngularJS
* UI Bootstrap
* Bootstrap CSS