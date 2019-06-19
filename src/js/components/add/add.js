import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent    from '../base.js';
import {PAGE_URL,
    FILE_ENTRY}               from '../../constants.js';
import Router                 from '../../router.js';
import StateStore             from '../../state.js';
import fs                     from '../../mahara-lib/files-lib.js';

class Add extends MaharaBaseComponent {
  render() {
      return <section>
          <h1>{this.gettext('add_new')}</h1>
          {isFileInputSupported &&
            <form ref="fileUploadForm">
                <input type="file" id="fileUpload" onChange={this.uploadFileChange.bind(this)} ref="fileUpload"/>
                <label htmlFor="fileUpload" className="big">{this.gettext('upload_file')}</label>
            </form>
          }
          <button onClick={() => Router.navigate(PAGE_URL.ADD_JOURNAL_ENTRY)} className="big">{this.gettext('add_journal_entry')}</button>
          <button onClick={this.recordAudio.bind(this)} className="big">{this.gettext('record_audio')}</button>
      </section>;
  }

  async uploadFileChange(e) {
    e.preventDefault();
    const fileUploadElement = this.refs.fileUpload;

    if (!fileUploadElement || !fileUploadElement.files || fileUploadElement.files.length === 0) return;

    try {
      // only single file allowed
      // that is why retrieve file with index 0
      let fileObj = fileUploadElement.files[0];
      fileObj.guid = guidGenerator();

      let tempFileUrl = await this.createTempFile(fileObj);

      // put file into store
      StateStore.dispatch({
        type: FILE_ENTRY.ADD_ENTRY,
        fileEntry: {
          type: FILE_ENTRY.TYPE,
          title: fileObj.name,
          description: null,
          tags: [],
          fileUrl: tempFileUrl,
          guid: fileObj.guid,
          fileName: fileObj.name,
          mimeType: fileObj.type || "image/jpeg",
          createdOn: Date.now()
        }
      });
    } catch(e) { this.handleError(e); }

    // remove file from input
    this.refs.fileUploadForm.reset();

    Router.navigate(PAGE_URL.PENDING);
  }

  createTempFile(fileObj) {
    return new Promise((resolve, reject) => {
      fs.readFileAsArrayBuffer(
        fileObj,
        data => {
          const fileExtension = fileObj.name.substr(fileObj.name.lastIndexOf('.'));
          const tempFileName = 'tmpfileupload-' + fileObj.guid + fileExtension;

          // as a result of this function we resolve promise with file url
          fs.getFileAndWriteInIt(
            tempFileName,
            data,
            tempFileUrl => resolve(tempFileUrl),
            error => reject(error) // error while writing file
          );
        },
        error => reject(error) // error while reading file
      );
    });
  }

  handleError(error) {
    alertify
        .okBtn(this.gettext("alert_ok_button"))
        .alert(this.gettext('record_audio_unavailable'));
  }

  recordAudio() {
    navigator.device.capture.captureAudio(this.mediaCaptureSuccess, this.handleError.bind(this), {limit:1});
  }

  mediaCaptureSuccess(files) {
    // only allow one recording
    const recording = files[0];
    const fileEntry = {
      type: FILE_ENTRY.TYPE,
      title: recording.name,
      description: null,
      tags: [],
      fileUrl: recording.fullPath,
      guid: guidGenerator(),
      fileName: recording.name,
      mimeType: recording.type || "audio/mp4",
      createdOn: Date.now()
    };

    StateStore.dispatch({ type: FILE_ENTRY.ADD_ENTRY, fileEntry });
    Router.navigate(PAGE_URL.PENDING);
  }
}

export default Add;

Add.propTypes = {
  pendingUploads: PropTypes.array.isRequired
};


const guidGenerator = () => {
  return (Math.random() + 1).toString(36).substring(2, 12) + (Math.random() + 1).toString(36).substring(2, 12);
};

export const isFileInputSupported = (function () {
    // Handle devices which falsely report support
    if (navigator.userAgent && navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
        return false;
    }
    // Create test element
    const el = document.createElement("input");
    el.type = "file";
    return !el.hasAttribute('disabled');
})();
