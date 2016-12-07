/*jshint esnext: true */

import StateStore,
       {maharaServer}                          from './state.js';
import Router                                  from './router.js';
import {getLangString}                         from './i18n.js';
import {REATTEMPT_UPLOADS_AFTER_MILLISECONDS,
        PENDING,
        JOURNAL,
        FILE_ENTRY,
        PAGE_URL}                              from './constants.js';

var langCodes;

export default function uploadNextItem(state){
  // This recursively uploads all items
  var guid = state.uploadGuid,
      now = Date.now(),
      that = this,
      item,
      millisecondsAgo,
      i;

  for(i = 0; i < state.pendingUploads.length; i++){
    if(guid && state.pendingUploads[i].guid === guid){
      item = state.pendingUploads[i];
    }
  }

  if(!item){
    console.log("Couldn't find guid to upload. Cancelling uploads.");
    StateStore.dispatch({type:PENDING.STOP_UPLOADS});
    return;
  }

  millisecondsAgo = item.startedUploadAt ? (now - item.startedUploadAt) : undefined;

  if(millisecondsAgo && (millisecondsAgo < REATTEMPT_UPLOADS_AFTER_MILLISECONDS)){
    console.log("This is normal, don't worry, but we won't attempt to upload again for " + ((REATTEMPT_UPLOADS_AFTER_MILLISECONDS - millisecondsAgo) / 1000) + " seconds.", item);
    return; // then we're probably already processing it
  }

  StateStore.dispatch({
    type:            PENDING.STARTED_UPLOAD_AT,
    guid:            guid,
    startedUploadAt: now
  });

  langCodes = state.lang;

  if(item.type === JOURNAL.TYPE){
    uploadJournal(item);
  } else if(item.type === FILE_ENTRY.TYPE){
    uploadFile(item);
  } else {
    console.log("Unrecognised upload type", item);
    StateStore.dispatch({type:PENDING.STOP_UPLOADS});
  }
}

function uploadJournal(journalEntry){
  maharaServer.uploadJournal(journalEntry, afterUploadComplete, afterUploadError);
}

function uploadFile(fileEntry){
  if(fileEntry.dataURL === true){
    fileEntry.dataURL = window.localStorage.getItem(fileEntry.guid);
  }
  maharaServer.uploadFile(fileEntry, afterUploadComplete, afterUploadError);
}

function afterUploadComplete(response){
  var item = response.journalEntry || response.fileEntry;
  console.log("Uploaded item", item);
  StateStore.dispatch({type:PENDING.UPLOAD_ITEM_FINISHED, guid:item.guid});
  StateStore.dispatch({type:PENDING.DELETE, guid:item.guid});
  StateStore.dispatch({type:PENDING.UPLOAD_NEXT});
}

function afterUploadError(errormessage){
  var item = response.journalEntry || response.fileEntry;
  StateStore.dispatch({type:PENDING.UPLOAD_ITEM_FINISHED, guid:item.guid});
  StateStore.dispatch({type:PENDING.STOP_UPLOADS});
//   if(response && response.error){
    // if(response.hasOwnProperty("isLoggedIn")){
    //   alertify.alert(getLangString(langCodes, "cant_sync_session_expired"), function (e, str) {
    //     Router.navigate(PAGE_URL.LOGIN_TYPE);
    //   });
    // } else if(response.hasOwnProperty('sesskeyError')){
    //   alertify.alert(getLangString(langCodes, "sesskey_scrape_error"));
    // } else if(response.hasOwnProperty("noProtocolAndDomain")){
    //   alertify.alert(getLangString(langCodes, "no_server_found"), function(e, str){
    //     Router.navigate(PAGE_URL.SERVER);
    //   });
    // } else if(response.hasOwnProperty("message")){
    //   alertify.alert(getLangString(langCodes, "server_response_prefix") + "\n" + response.message);
    // }
    if (errormessage) {
        alertify.alert("Problem uploading. Response was: " + errormessage);
    }
    else {
        alertify.alert("Error: upload failed.");
    }
    return;
//   }
}
