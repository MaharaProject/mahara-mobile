import httpLib      from './http-lib.js';

const service = "maharamobile";
const component = "module/mobileapi";
const basicLoginUrl = "module/mobileapi/json/token.php";

export default function localLogin(username, password, successCallback, errorCallback) {
    var url = this.getWwwroot() + basicLoginUrl;

    httpLib.postAsJSON(
        url,
        {
            "username": username,
            "password": password,
            "service": service,
            "component": component,
            "clientname": "Mahara Mobile", // TODO: lang string
            "clientenv": device.platform + ', ' + device.manufacturer + ', ' + device.model,
            "clientguid": device.uuid,
        },
        (json) => {
            if (!json.token) {
                errorCallback.call(this, json, json);
            }
            successCallback.call(this, json.token);
        },
        errorCallback
    );
}
