import httpLib               from './http-lib.js';
import {dataURItoBlob,
    trimString}          from './util.js';

const wsfunction = 'module_mobileapi_upload_file';

const UPLOAD_HANDLER_TYPE = {
    PHONEGAP_UPLOADER: "UPLOAD_HANDLER_PHONEGAP",
    XHR_UPLOADER: "UPLOAD_HANDLER_XHR"
};


export default function uploadFile(fileEntry, successCallback, errorCallback) {
    if (!this.getWwwroot() || !this.getWSToken()) {
        return errorCallback({
            error: true,
            message: "You have not yet connected to a Mahara instance.",
            fileEntry: fileEntry
        });
    }

    if (!this.getDefaultFolderName()){
        return errorCallback({
            error: true,
            message: "No folder configured as upload target.",
            fileEntry: fileEntry
        });
    }

    var wsParams = {};
    wsParams.foldername = fileEntry.targetFolderName || this.getDefaultFolderName();
    wsParams.title = fileEntry.title;
    if (fileEntry.description) {
        wsParams.description = fileEntry.description;
    }
    if (fileEntry.tags) {
        wsParams.tags = fileEntry.tags;
    }

    httpLib.callWebservice(
        wsfunction,
        wsParams,
        function winFn(responsejson) {
            successCallback(
                {
                    fileEntry: fileEntry,
                    response: responsejson
                }
            );
        },
        function failFn(raw, jsException, json) {
            console.warn("Error during upload:", arguments);
            var message = false;
            if (json) {
                if (json.error_message) {
                    message = json.error_message;
                }
                if (json.message) {
                    message = json.message;
                }
            }

            return errorCallback(message);
        },
        fileEntry,
        'filetoupload'
    );
}
