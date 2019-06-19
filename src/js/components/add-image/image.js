import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent  from '../base.js';
import Select, { Creatable } from 'react-select';

import { setTextareaHeight } from '../../util';

class ImageDetails extends MaharaBaseComponent {
    constructor(props) {
        super(props);

        let userTags = props.server.sync.tags.map(tag => tag.tag);

        this.imageToEdit = props.imageToEdit;

        this.state = {
            userTags: userTags,
            selectedTags: props.imageToEdit.guid ? this.imageToEdit.tags : [],
            targetFolderName: props.imageToEdit.guid ? this.imageToEdit.targetFolderName : this.props.server.defaultFolderName
        };

        this.changeTags = this.changeTags.bind(this);
        this.changeTagsOnBlur = this.changeTagsOnBlur.bind(this);
        this.changeFolder = this.changeFolder.bind(this);
        this.tags = this.props.imageToEdit.tags;
    }
    render() {
        const { title, description, mimeType, fileUrl } = this.props.imageToEdit;

        const folderOptions = this.props.server.sync.folders
          .map(folder => ({ label: folder.title, value: folder.title }));

        const tagsOptions = this.state.userTags.concat(this.state.selectedTags)
          .filter((tag, id, tags) => tags.indexOf(tag) === id) // make unique
          .map(tag => ({ value: tag, label: tag }));

        return <div>
            {mimeType.indexOf('image/') === 0 ?
              <img src={fileUrl} className="fileUploadPreview"/> : null
            }
            <h2>{this.gettext('library_title')}</h2>
            <input ref="title" type="text" className="subject" defaultValue={title} />
            <h2>{this.gettext('description')}</h2>
            <textarea ref="textarea" className="body" defaultValue={description} />
            <h2>{this.gettext('library_tags')}</h2>
              <Creatable
                multi={true}
                value={this.state.selectedTags}
                onChange={this.changeTags}
                onBlur={this.changeTagsOnBlur}
                clearable={false}
                options={tagsOptions}
              />
            {this.props.server.sync.folders.length < 2 ? null :
              <div>
                <h2>{this.gettext('library_folder')}</h2>
                  <Select
                    value={this.state.targetFolderName}
                    onChange={this.changeFolder}
                    clearable={false}
                    options={folderOptions}
                  />
              </div>
            }
        </div>;
    }
    changeTags(tagsObj) {
      this.setState({ selectedTags: tagsObj.map(t => t.label) });
      // parent component accesses it this way
      this.tags = tagsObj.map(t => t.label);
    }

    changeTagsOnBlur(e) {
      let newTags = this.state.selectedTags.slice(0); // copy array
      newTags.push(e.target.value);

      this.setState({ selectedTags: newTags });
      this.tags = newTags;
    }

    changeFolder(selectedFolder) {
      this.setState({ targetFolderName: selectedFolder.value });
      this.props.onChangeFolder(selectedFolder.value);
    }

    componentDidMount() {
      setTextareaHeight(this.refs.textarea);
    }}

export default ImageDetails;

ImageDetails.propTypes = {
  server: PropTypes.object.isRequired,
  onChangeFolder: PropTypes.func.isRequired,
  imageToEdit: PropTypes.object.isRequired,
};
