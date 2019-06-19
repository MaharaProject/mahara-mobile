import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent    from '../base.js';
import StateStore             from '../../state.js';
import Router                 from '../../router.js';
import {PENDING,
    FILE_ENTRY,
    JOURNAL,
    PAGE_URL}          from '../../constants.js';

class PendingItem extends MaharaBaseComponent {
    render() {
        var img = '';
        if (this.props.type == FILE_ENTRY.TYPE && this.props.mimeType.indexOf('image/') === 0) {
            img = <img className="thumbnail" src={this.props.fileUrl} />;
        }
        return <div key={this.props.guid} className={"item" + (this.props.lastItem ? " lastItem" : "") } onClick={this.edit}>
            <h2>
                <button onClick={this.delete} className="delete small">&times; {this.gettext('delete')}</button>
                <button onClick={this.edit} className="edit small">&larr; {this.gettext('edit')}</button>
                {this.props.title || this.props.filename}
            </h2>
            {img}
            <p>{this.props.body}</p>
        </div>;
    }
    delete = (e) => {
        e.stopPropagation();
        var that = this;
        var reallyDelete = function () {
            StateStore.dispatch({ type: PENDING.DELETE, guid: that.props.guid });
        };
        alertify.okBtn(this.gettext("confirm_delete_ok_button"))
            .cancelBtn(this.gettext("button_cancel"))
            .confirm(this.gettext("confirm_delete"), reallyDelete);
    }
    edit = (e) => {
        e.stopPropagation();
        switch (this.props.type) {
            case JOURNAL.TYPE:
                StateStore.dispatch(
                    {
                        type: PENDING.EDIT_JOURNAL,
                        guid: this.props.guid
                    }
                );
                break;
            case FILE_ENTRY.TYPE:
                StateStore.dispatch(
                    {
                        type: PENDING.EDIT_IMAGE,
                        guid: this.props.guid
                    }
                );
                break;
        }
    }
}

export default PendingItem;

PendingItem.propTypes = {
  type: PropTypes.string.isRequired,
  guid: PropTypes.string.isRequired,
  lastItem: PropTypes.bool.isRequired,
  body: PropTypes.string,
  title: PropTypes.string,
  filename: PropTypes.string,
  fileUrl: PropTypes.string,
  mimeType: PropTypes.string,
};
