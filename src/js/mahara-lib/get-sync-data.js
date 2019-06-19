import httpLib from './http-lib.js';
import StateStore from '../state.js';
import {getLangString}      from '../i18n.js';
import {STORAGE} from '../constants.js';
import fsLib from './files-lib.js';

export function refreshUserProfile(successFn = null, failFn = null) {

    this.getSyncData(
        function winfn(syncData) {
            StateStore.dispatch(
                {
                    type: STORAGE.SET_USER_SYNC_DATA,
                    sync: {
                        // There's some redundant naming here because "Sync" is a batch
                        // function, and the return object has a separate key for each
                        // data type it's returning. Many of those keys, in turn, have
                        // their own key with the same name, representing a list of objects.
                        // e.g.:
                        // syncData.blogs = {numblogs: 1, blogs:[...]}
                        blogs: syncData.blogs.blogs,
                        folders: syncData.folders.folders,
                        // TODO: notifications is commented out, because currently it not used anywhere in the app
                        // notifications: syncData.notifications.notifications,
                        tags: syncData.tags.tags,
                        // Userprofile and Userprofileicon return only one item each, so no
                        // double-naming needed. :)
                        userprofile: syncData.userprofile,
                        userprofileicon: syncData.userprofileicon
                    }
                }
            );
            if (successFn) {
                successFn(syncData);
            }
        },
        function failCallback(error) {
            console.log("Problem getting sync data.");
            var lang = StateStore.getState().lang;
            alertify
                .okBtn(getLangString(lang, "alert_ok_button"))
                .alert(getLangString(lang, "server_sync_error"));
            if (failFn) {
                return failFn(error);
            }
        }
    );
}

/**
 * A function to sync data from the user's account
 */
export default function getSyncData(winfn, failfn) {
    var wsfunction = "module_mobileapi_sync";
    var wscomponent = "module/mobileapi/webservice";
    var maharaServer = this;

    // Can't sync if the user hasn't authenticated yet.
    if (!this.getWwwroot() || !this.getWSToken()) {
        return failfn(
            {
                error: true,
                isLoggedin: false
            }
        );
    }

    httpLib.callWebservice(
        wsfunction,
        {
            blogs: {},
            folders: {},
            // TODO: notifications is commented out, because currently it not used anywhere in the app
            // notifications: {
            //     lastsync: 0 // TODO: Store lastsync
            // },
            tags: {},
            userprofile: {},
            userprofileicon: {},
        },
        function (syncData) {
            winfn(syncData);
        },
        failfn
    );
}

export function refreshUserIcon(newicon) {

    if (!newicon) {
        return clearUserIcon();
    }

    var filename = 'userprofileicon';
    switch (newicon.mimetype) {
        case 'image/jpeg':
            filename = filename + '.jpg';
            break;
        case 'image/gif':
            filename = filename + '.gif';
            break;
        case 'image/png':
            filename = filename + '.png';
            break;
        default:
            console.log("Unsupported mimetype for profileicon: " + newicon.mimetype);
            return clearUserIcon();
    }

    var url = this.getWwwroot()
        + "module/mobileapi/download.php?wsfunction=module_mobileapi_get_user_profileicon&wstoken="
        + this.getWSToken();

      httpLib.raw('GET', null, url, null, null,
        function() {
          if (this.status == 200) {

            const profileIcon = new Blob([this.response], { type: newicon.mimetype });

            fsLib.createFile(filename, function (fileEntry) {
              fsLib.writeInFile(fileEntry, profileIcon,
                () => fileEntry.file(
                  file => fsLib.readFileAsArrayBuffer(file,
                    function (fileEntry) {
                      StateStore.dispatch({
                        type: STORAGE.SET_USER_PROFILE_ICON,
                        icon: `${fileEntry.toURL()}?d=${Date.now()}`
                      });
                    }.bind(this, fileEntry)
                  )
                )
              );
            });
          }
        },
        error => {
          console.log("failed downloading " + url);
          console.log(JSON.stringify(error, null, 4));
          return clearUserIcon();
        },
        { responseType: 'blob' } // because we expect an image
      );
}

function clearUserIcon() {
    StateStore.dispatch(
        {
            type: STORAGE.SET_USER_PROFILE_ICON,
            icon: null,
        }
    );
    return null;
}
