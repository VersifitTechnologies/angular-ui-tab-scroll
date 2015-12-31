angular-ui-tab-scroll
=====================

A scrollable tab plugin intended for scrolling UI Bootstrap [tabset](https://angular-ui.github.io/bootstrap/#/tabs).

Here is a working demo : http://plnkr.co/edit/YJNDaQ?p=preview

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

### Options
* `show-tooltips` - whether or not to show the side-tooltips. default is `true`.
* `tooltip-left-placement` - which tooltip direction to use for the left tooltip (bottom, top, left, right). default is `right`.
* `tooltip-right-placement` - which tooltip direction to use for the right tooltip (bottom, top, left, right). default is `left`.
* `scroll-by` - the amount of pixels to offset upon each scroll. default is `50`
* `tooltip-text-selector` - the selector for your tooltips. default is `tab-heading`

These options can directly be set on each directive as **DOM attributes**. 

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

> **Important Note:** When an option is both defined at directive level and at config level, the value specified in the DOM **takes precedence over the one from the config**!.

### Api
there is an exposed api, with it you can call:
* `doRecalculate()` - force a re-calculation of the scroll, this will calculate if the scroll buttons are needed and which to enable\disable. usually needed after a tabs are added or removed.
* `scrollTabIntoView()` - scroll the selected tab into center of view. or if you want to scroll to a specific tab index:
* `scrollTabIntoView(number)` - scroll the tab index into center of view.

### Styling
you can use the default style by referencing `angular-ui-tab-scroll.css`, or you can chose to use the alternative customized flat style by referencing the supplied `angular-ui-tab-scroll-flat.css`.
both files are the result of a transpiled scss, which are also included in this package.

if you intend to have your own design i highly recommend you start with `angular-ui-tab-scroll-flat.scss` with it you can unleash the power of scss&css.

to change the icons on the scroll buttons you simply need to override the relevant button's css with your own css

Example:
```css
.right-nav-button:before{
  font-family: 'Glyphicons Halflings';
  content: '\e080';
}
```

### Dependencies
* AngularJS
* UI Bootstrap
* Bootstrap CSS