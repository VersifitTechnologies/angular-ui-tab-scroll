angular-ui-tab-scroll
=====================

A scrollable tab plugin compatible with angular-ui bootstrap tabs.

# Dependencies

* Bootstrap CSS
* AngularJS
* angular-ui-bootstrap

# Usage

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

# Options

* `show-tooltips` - whether or not to show the side-tooltips
* `tooltip-left` - which tooltip direction to use for the left tooltip (bottom, top, left, right) - defaults to bottom
* `tooltip-right` - which tooltip direction to use for the right tooltip (bottom, top, left, right) - defaults to bottom
* `tooltip-text-selector` - the selector for your tooltips, defaults to `tab-heading`


These options can directly be set on each directive as **DOM attributes**. 


Example:

```
<scrollable-tabset show-tooltips="true" 
	tooltip-left="right"
	tooltip-right="left">
	<tabset>
		<tab ng-repeat="x in tabs">...</tab>
	</tabset>
</scrollable-tabset>
```

Or, they can be configured globally for all your `scrollable-tabset` directives, by using the **scrollableTabsetConfigProvider**, in the `config` section of your app.

Example:

```
angular.module('yourApp', [])
	.config(['scrollableTabsetConfigProvider', function(scrollableTabsetConfigProvider){
		scrollableTabsetConfigProvider.setShowTooltips(false);
		//...set other properties here
	}]);
```
Here is a working plunker : http://plnkr.co/edit/j3S0bPOuhjG08vn9fK4c?p=preview

This way, you can keep the directive usage simple in all your html templates!


> **Important Note:** When an option is both defined at directive level and at config level,  the value specified in the DOM **takes precedence over the one from the config**!.


