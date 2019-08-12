(function(){
  window.mahara = {i18n:{}};
  var deps = {
    json: ['i18n/strings.json'],
    scripts: ['bundle.js', 'lib/ripple.js/ripple.js', 'lib/alertify.js/alertify.js']
  };

  function getDeviceLanguage() {
    return navigator.globalization.getPreferredLanguage(
      function(locale) {
        window.mahara.i18n.lang = window.mahara.i18n.strings.hasOwnProperty(locale.value) ? locale.value : 'en';
      },
      function() {
        window.mahara.language = 'en';
      }
     );
  }

  function ready(){
    window.mahara.addResources(deps.json, addScripts, onError);
    var Sentry = cordova.require("sentry-cordova.Sentry");
    Sentry.init({ dsn: 'https://abfd5ab9b2134d30a5e9506c2a8d1de4@sentry.catalyst.net.nz/195' });
    Raven.config('https://abfd5ab9b2134d30a5e9506c2a8d1de4@sentry.catalyst.net.nz/195').install();
    
    function addScripts(jsons){
      window.mahara.i18n.strings = jsons[deps.json[0]];
      window.mahara.addResources(deps.scripts);
    }
  }

  if(window.isCordova){
    document.addEventListener("deviceready", ready);
  } else {
    document.addEventListener("DOMContentLoaded", ready);
  }

  window.mahara.addResources = function(resources, successCallback, errorCallback){
    // Adds JS, CSS, Gets JSON and then calls the callback
    var resourcesRemaining = resources ? resources.length : 0,
        responses = {},
        oneResourceLoaded = function(key){
          return function(response){
            responses[key] = response;
            resourcesRemaining--;
            if(resourcesRemaining === 0) if(successCallback) successCallback(responses);
          };
        },
        resource,
        element,
        uri,
        i;

    for(i = 0; i < resources.length; i++){
      resource = resources[i].replace(/^\s+/, '').replace(/\\/g, "\/");
      if(resource.match(/:\//) || resource.indexOf(0, 2) === "\/\/") { //also matches //domain for protocol-relative links
        console.log("ERROR: Refusing to add resource that doesn't begin with /path. Was: " + resource);
        continue;
      }
      if(resource.match(/\.js$/)){
        element = document.createElement("script");
        element.addEventListener("load",  oneResourceLoaded(resource), false);
        element.addEventListener("error", oneResourceLoaded(resource), false);
        element.setAttribute("src", resource);
        document.body.appendChild(element);
      } else if(resource.match(/\.css$/) || resource.match(/\.scss$/)){
        element = document.createElement("link");
        element.setAttribute("rel", "stylesheet");
        element.addEventListener("load",  oneResourceLoaded(resource), false);
        element.addEventListener("error", oneResourceLoaded(resource), false);
        element.setAttribute("href", resource);
        document.head.appendChild(element);
      } else if(resource.match(/\.json$/)){
        var req = http.getAsJSON(resource, undefined, oneResourceLoaded(resource));
      } else {
        console.log("Unable to add resource: " + resource);
      }
    }
  };

  var http = {
    raw: function(method, headers, path, getParams, postData, successCallback, errorCallback, useAuthMiddleware){
      if(useAuthMiddleware === undefined) useAuthMiddleware = true;
      var request = new XMLHttpRequest();
      if(getParams){
        if(path.indexOf("?") === -1){
          path += "?";
        }
        for(var key in getParams){
          path += (path.slice(-1) === "?" ? "" : "&") + encodeURIComponent(key) + "=" + encodeURIComponent(getParams[key]);
        }
      }
      request.open(method, path);
      request.onload = successCallback;
      request.onerror = errorCallback;
      request.send(postData);
      return http;
    },
    get: function(path, getParams, successCallback, errorCallback, headers){
      return http.raw("GET", headers, path, getParams, null, successCallback, errorCallback);
    },
    getAsJSON: function(path, getParams, successCallback, errorCallback, headers){
      return http.get(path, getParams, http.asJSON(successCallback, errorCallback), errorCallback, headers);
    },
    asJSON: function(successCallback, errorCallback){
      return function asJSON(response){
        var jsonData;
        try {
          jsonData = JSON.parse(response.target.responseText);
        } catch (e){
          return errorCallback(response, e);
        }
        successCallback.call(this, jsonData, arguments);
      };
    }
  };

  function onError(err){
    alert(err);
  }

}());
