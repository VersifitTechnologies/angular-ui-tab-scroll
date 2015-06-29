angular-ui-tab-scroll
=====================

A scrollable tab plugin compatible with angular-ui bootstrap tabs.

Dependencies
============
* Bootstrap CSS
* jQuery
* AngularJS
* angular-ui-bootstrap

Usage
=====

* Include `angular-ui-tab-scroll.js` and `angular-ui-tab-scroll.css` in your page.
* Add `ui.tab.scroll` to your angular module dependencies.
* Wrap your `<tabset>` inside of `<scrollable-tabset>`, like so:

```html
<scrollable-tabset show-tooltips="true" watch-expression="tabs">
  <tabset>
    <tab ng-repeat="x in tabs">...</tab>
  </tabset>
</scrollable-tabset>
```
Options
=======
* `show-tooltips` - whether or not to show the side-tooltips
* `tooltip-left` - which tooltip direction to use for the left tooltip (bottom, top, left, right) - defaults to bottom
* `tooltip-right` - which tooltip direction to use for the right tooltip (bottom, top, left, right) - defaults to bottom
* `tooltip-text-selector` - the selector for your tooltips, defaults to `*:not(:has("*:not(span)"))`
* `scroll-left-icon` - the CSS class(es) to customize the left navigation button icon, defaults to `glyphicon glyphicon-chevron-left`
* `scroll-right-icon` - the CSS class(es) to customize the right navigation button icon, defaults to `glyphicon glyphicon-chevron-right`
