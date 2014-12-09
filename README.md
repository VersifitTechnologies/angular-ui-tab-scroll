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
* `watch-expression` - an expression to watch for changes, to update the tab left/right buttons
* `tooltipLeft` - which tooltip direction to use for the left tooltip (bottom, top, left, right) - defaults to bottom
* `tooltipRight` - which tooltip direction to use for the right tooltip (bottom, top, left, right) - defaults to bottom
* `tooltipTextSelector` - the selector for your tooltips, defaults to `*:not(:has("*:not(span)"))`
