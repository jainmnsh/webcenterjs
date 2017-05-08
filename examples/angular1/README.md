# WebCenterJS + AngularJS 1.x
A small application (~100 lines of JS code) built with the following 

* [AngularJS 1.x](https://angularjs.org/)
* [Materialize CSS](http://materializecss.com/)
* [Angular Materialize](https://krescruz.github.io/angular-materialize/)

to perform the following

* Login to /webcenter, /cs, /rest
* Fetch user activities.
* Update status.

## Configuration
Change the following in app.js to suit your Oracle WebCenter environment

```javascript
        /**
         * TODO : Make changes to the below URLs to suit your Oracle WebCenter
         * environment.
         */   
        var restBaseUrl = "http://wchost.lan/rest";
        var wcBaseUrl = "http://wchost.lan/webcenter";
        var csBaseUrl = "http://wchost.lan/cs";
    
        WebCenter.Config.setRestBaseUrl(restBaseUrl);
        WebCenter.Config.setWcBaseUrl(wcBaseUrl);
        WebCenter.Config.setCsBaseUrl(csBaseUrl);
```

## Running
Most OOTB Oracle WebCenter installations are not CORS enabled. If /rest is served from behind a webproxy like Apache, CORS can be enabled at Apache level. There is a lot of help on how to enable this out there.

If WebCenterJS is used in a NodeJS / React Native environment, no changes are required.