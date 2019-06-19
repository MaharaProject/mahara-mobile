import {maharaServer} from '../state.js';
import fsLib from './files-lib.js';
import jQuery from 'jquery';

const httpLib = {
    /**
     * Raw asynchronous HTTP request. (Wrapper around XMLHttpRequest)
     *
     * @param {string} method HTTP method to use
     * @param {object} headers List of HTTP headers to pass to XMLHttpRequest.setRequestHeader()
     * @param {string} path
     * @param {object} getParams
     * @param {string} postData
     * @param function(Event) successCallback
     * @param function(Event) errorCallback
     * @returns
     */
    raw: function (method, headers, path, getParams, postData, successCallback, errorCallback, options) {
        var request = new XMLHttpRequest(),
            key;

        if (getParams) {
            if (path.indexOf("?") === -1) {
                path += "?";
            }
            for (key in getParams) {
                path += (path.slice(-1) === "?" ? "" : "&") + encodeURIComponent(key) + "=" + encodeURIComponent(getParams[key]);
            }
        }
        if ("withCredentials" in request) {
            request.withCredentials = true;
            request.open(method, path, true);
        } else {
            request.open(method, path);
        }
        if (headers) {
            for (key in headers) {
                request.setRequestHeader(key, headers[key]);
            }
        }
        request.onload = successCallback;
        if (options && Object.keys(options).length) {
          for (let o in options) {
            request[o] = options[o];
          }
        }
        request.onerror = errorCallback;
        request.send(postData);
        return request;
    },

    /**
     * Asynchronous GET request
     *
     * @param {string} path
     * @param {object} getParams
     * @param function(Event) successCallback
     * @param function(Event) errorCallback
     * @param {object} headers
     * @returns
     */
    get: function (path, getParams, successCallback, errorCallback, headers) {
        return httpLib.raw("GET", headers, path, getParams, null, successCallback, errorCallback);
    },

    /**
     * Asynchronous GET request that expects to receive a JSON-encoded response
     *
     * @param {string} path
     * @param {object} getParams
     * @param function(Object jsonData) successCallback
     * @param function(Event, Exception, Object jsonData) errorCallback
     * @param {Object} headers
     * @returns
     */
    getAsJSON: function (path, getParams, successCallback, errorCallback, headers) {
        return httpLib.get(path, getParams, httpLib.asJSON(successCallback, errorCallback), errorCallback, headers);
    },

    /**
     * Success callback function to convert JSON raw response to JSON object
     *
     * @param {function(Object jsonData)} successCallback
     * @param {function(Event, Exception, Object jsonData)} errorCallback
     * @returns
     */
    asJSON: function (successCallback, errorCallback) {
        return function asJSON(response) {
            var jsonData;
            var rawText;
            if (typeof response.target !== "undefined" && typeof response.target.responseText !== "undefined") {
                rawText = response.target.responseText;
            }
            else if (typeof response.response !== "undefined") {
                rawText = response.response;
            }
            else {
                return errorCallback.call(httpLib, response, null, null);
            }
            try {
                jsonData = JSON.parse(rawText);
            } catch (e) {
                return errorCallback.call(httpLib, response, e, rawText);
            }
            // When mahara knows JSON is expected in the response,
            // and there's an error, it prints an error code and
            // message.
            //
            // The Legacy API sets "fail"
            if (jsonData.error || jsonData.fail) {
                return errorCallback.call(httpLib, response, null, jsonData);
            }
            return successCallback.call(httpLib, jsonData);
        };
    },

    /**
     * Send a POST request with application/x-www-form-urlencoded, like a form submission
     *
     * @param {string} path
     * @param {Object} getParams
     * @param {Object} postParams
     * @param {function(Event)} successCallback
     * @param {function(Event)} errorCallback
     * @param {Object} headers
     * @returns
     */
    postText: function (path, getParams, postParams, successCallback, errorCallback, headers) {
        // Can only handle key:values of text, no blobs
        var postData;

        if (postParams) {
            postData = "";
            for (var key in postParams) {
                postData += (postData.length === 0 ? "" : "&") + encodeURIComponent(key) + "=" + encodeURIComponent(postParams[key]);
            }
            if (!headers) headers = {};
            headers["Content-type"] = "application/x-www-form-urlencoded";
        }
        return httpLib.raw("POST", headers, path, getParams, postData, successCallback, errorCallback);
    },

    /**
     * Send a POST request that's not like a form submission(?)
     *
     * @param {string} path
     * @param {Object} getParams
     * @param {Object} postParams
     * @param {FileEntry} fileUpload The file to upload. Might be an actual FileEntry object, or a plain object with some metadata fields.
     * @param {string} filesParamName Name of the POST param with the file content.
     * @param {function(Event)} successCallback
     * @param {function(Event)} errorCallback
     * @param {Object} headers
     * @returns
     */
    postData: function (path, getParams, postParams, successCallback, errorCallback, headers, fileEntry, filesParamName) {
        var formData = new FormData();

        if (fileEntry) {
          fsLib.getExternalFile(fileEntry.fileUrl, function(entry) {
            entry.file(function (file) {
              const reader = new FileReader();
              reader.onloadend = function() {
                // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
                var blob = new Blob([new Uint8Array(this.result)], { type: fileEntry.mimeType });
                postParams[filesParamName] = blob;

                for (let key in postParams) {
                  formData.append(key, postParams[key]);
                }

                return httpLib.raw("POST", headers, path, getParams, formData, successCallback, errorCallback);
              };
              // Read the file as an ArrayBuffer
              reader.readAsArrayBuffer(file);
            });
          });
        } else {
            for (let key in postParams) {
                if (!postParams.hasOwnProperty(key)) {
                    continue;
                }
                formData.append(key, postParams[key]);
            }
            return httpLib.raw("POST", headers, path, getParams, formData, successCallback, errorCallback);
        }
    },

    /**
     * Send a POST request and process the results into JSON
     *
     * @param {any} path
     * @param {any} getParams
     * @param {any} postParams
     * @param {any} successCallback
     * @param {any} errorCallback
     * @param {any} headers
     * @returns
     */
    postAsJSON: function (path, getParams, postParams, successCallback, errorCallback, headers, fileUpload, filesParamName) {
        return httpLib.raw("POST", null, path, getParams, JSON.stringify(postParams), httpLib.asJSON(successCallback, errorCallback), errorCallback, headers, fileUpload, filesParamName);
    },

    /**
     * Access a Mahara REST-based webservice using an auth token.
     *
     * @param {string} wsfunction Name of the function to access
     * @param {object} wsparams
     * @param function() successCallback
     * @param function() errorCallback
     * @returns XMLHttpRequest
     */
    callWebservice(
        wsfunction,
        wsparams,
        successCallback,
        errorCallback,
        filetoupload,
        fileparamname
    ) {

        // TODO: some kind of auto-fallthrough to send you to the auth system when you need to re-auth?
        // Allow for a manually-provided token, to make it easier to validate
        // newly-provided tokens
        var wstoken = false;
        if (wsparams.wstoken) {
            wstoken = wsparams.wstoken;
            delete wsparams.wstoken;
        }
        else if (maharaServer.getWSToken()) {
            wstoken = maharaServer.getWSToken();
        }

        if (!wstoken) {
            // TODO: lang string
            return errorCallback("Not connected to webservice yet");
        }

        var getparams = {
            alt: 'json',
        };
        var postparams = {
            wsfunction: wsfunction,
            wstoken: wstoken,
        };
        try {
            postparams = Object.assign(postparams, wsparams);
        } catch (e) {
            // TODO: log that wsparams was the wrong type of object?
        }

        if (filetoupload && fileparamname) {

            // cordova-plugin-file-transfer won't do our POST params in the PHP
            // form array format, so we'll do them as GET params.
            jQuery.each(postparams, function(k, v) {
                if (typeof v === "object") {
                    getparams[k] = v;
                    delete postparams[k];
                }
            });

            var queryString = '';
            if (Object.keys(getparams).length) {

                var arrayifiedParams = (function buildQueryString(name, value) {
                    if (typeof value !== "object") {
                        var str = name + '=' + encodeURIComponent(value);
                        return str;
                    }
                    else {
                        var obj = jQuery.map(value, function(v, k) {
                            var nextname = k;
                            if (name) {
                                nextname = name + '[' + k + ']';
                            }
                            return buildQueryString(nextname, v);
                        });
                        return obj;
                    }
                }('', getparams));
                queryString = '?' + arrayifiedParams.join('&');
            }

            return httpLib.postData(
                maharaServer.getWwwroot() + 'webservice/rest/server.php' + queryString,
                null,
                postparams,
                httpLib.asJSON(successCallback, errorCallback),
                errorCallback,
                null,
                filetoupload,
                fileparamname
            );
        }
        else {
            // TODO: handle a "re-auth needed" failure?
            return httpLib.postAsJSON(
                maharaServer.getWwwroot() + 'webservice/rest/server.php',
                getparams,
                postparams,
                successCallback,
                errorCallback
            );
        }
    }
};

export default httpLib;
