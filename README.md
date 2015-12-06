angular-ui-tab-scroll
=====================

A scrollable tab plugin intended for scrolling UI Bootstrap [tabset](https://angular-ui.github.io/bootstrap/#/tabs).

Here is a working demo : http://plnkr.co/edit/YJNDaQ?p=preview

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

This way, you can keep the directive usage simple in all your html templates!


> **Important Note:** When an option is both defined at directive level and at config level,  the value specified in the DOM **takes precedence over the one from the config**!.

# API

there is an exposed api, with it you can initiate a re-calculation of the scroll.

# Styling

to change the icons on the scroll buttons you simply need to override the relevant button's css with your own css

Example:
```
.right-nav-button:before{
  font-family: 'Glyphicons Halflings';;
  content: '\e080';
}
```

# Dependencies

* AngularJS
* UI Bootstrap
* Bootstrap CSS



