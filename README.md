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

You can turn tooltips on and off with the `show-tooltips` attribute, and if your tabs aren't static, you may want to specify `watch-expression`.
