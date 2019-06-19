import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent    from '../base.js';
import Router                 from '../../router.js';
import StateStore,
       {maharaServer}         from '../../state.js';
import ImageDetails           from './image.js';
import {FILE_ENTRY, PAGE_URL} from '../../constants.js';

class AddImage extends MaharaBaseComponent {
  constructor(props) {
      super(props);

      this.imageToEdit = this.props.pendingUploads.find(upload => upload.guid === this.props.imageToEdit);
      this.state = {
          targetFolderName: this.imageToEdit.guid ? this.imageToEdit.targetFolderName : this.props.server.defaultFolderName
      };

      this.changeFolder = this.changeFolder.bind(this);
  }

    render() {
        var pageTitle = this.gettext("add_image_title");
        var imageToEdit = null;
        if (this.props.imageToEdit && Array.isArray(this.props.pendingUploads)) {
            // Find the journal
            for (var i = 0; i < this.props.pendingUploads.length; i++) {
                if (this.props.pendingUploads[i].guid === this.props.imageToEdit) {
                    imageToEdit = this.props.pendingUploads[i];
                    pageTitle = this.gettext("edit_file_title");
                    break;
                }
            }
        }
        return <section>
            <h1>{pageTitle}</h1>
            <ImageDetails {...this.props} imageToEdit={imageToEdit} ref="imageDetails" onChangeFolder={this.changeFolder} />
            <button ref="saveButton" onClick={this.saveButton}>{this.gettext("add_image_save_button") }</button>
        </section>;
    }
    saveButton = () => {
        var titlebox = this.refs.imageDetails.refs.title,
            textarea = this.refs.imageDetails.refs.textarea,
            tags = this.refs.imageDetails.tags,
            targetFolderName = this.state.targetFolderName,
            imageDetails;
        var oldImage = this.refs.imageDetails.imageToEdit;

        imageDetails = {
            type: FILE_ENTRY.TYPE,
            guid: oldImage.guid,
            title: titlebox.value,
            description: textarea.value,
            tags: tags,
            targetFolderName: targetFolderName
        };

        if (!imageDetails.title) {
            alertify
                .okBtn(this.gettext("alert_ok_button"))
                .alert(this.gettext("edit_image_required"));
            return;
        }

        // Check to make sure it still has the right file extension.
        var oldExtension = oldImage.title.substr(oldImage.title.lastIndexOf('.'));
        if (oldExtension && imageDetails.title.lastIndexOf(oldExtension) !== (imageDetails.title.length - oldExtension.length)) {
            imageDetails.title = imageDetails.title + oldExtension;
        }

        StateStore.dispatch({ type: FILE_ENTRY.EDIT_ENTRY, imageDetails: imageDetails });
        Router.navigate(PAGE_URL.PENDING);
    }

    guidGenerator() {
        return (Math.random() + 1).toString(36).substring(2, 12) + (Math.random() + 1).toString(36).substring(2, 12);
    }

    changeFolder(targetFolderName) {
        this.setState({'targetFolderName': targetFolderName});
    }
}

export default AddImage;

AddImage.propTypes = {
  pendingUploads: PropTypes.array.isRequired,
  imageToEdit: PropTypes.string.isRequired,
  server: PropTypes.object.isRequired
};
