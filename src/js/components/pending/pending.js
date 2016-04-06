/*jshint esnext: true */
import React from 'react';
import MaharaBaseComponent from '../base.js';
import ExpandCollapse      from '../expand-collapse/expand-collapse.js';
import StateStore          from '../../state.js';
import {PENDING}           from '../../constants.js';
import PendingItem         from './pending-item.js';

class Pending extends MaharaBaseComponent {
  constructor(){
    super();
    this.deleteAll = this.deleteAll.bind(this);
    this.uploadAll = this.uploadAll.bind(this);
    this.renderButtonTray = this.renderButtonTray.bind(this);
  }
  render() {
    return <section>
      {this.renderPendingUploads()}
      {this.renderButtonTray()}
    </section>;
  }
  deleteAll(){
    var reallyDeleteAll = function(){
      StateStore.dispatch({type:PENDING.DELETE_ALL});
    }
    alertify.okBtn(this.gettext("confirm_delete_all_ok_button"))
            .cancelBtn(this.gettext("button_cancel"))
            .confirm(this.gettext("confirm_delete_all"), reallyDeleteAll);
  }
  uploadAll(){
    var journalEntry,
        that = this,
        dontReattemptUploadWithinMilliseconds = 1000 * 60 * 10;

    if(!this.props.pendingUploads || this.props.pendingUploads.length === 0) return;

    StateStore.dispatch({type:PENDING.UPLOAD_NEXT});
  }
  renderButtonTray(){
    if(this.noPendingUploads()) return "";
    return <div className="buttonTray">
      <button onClick={this.uploadAll} className="uploadAll small">{this.gettext("upload_all_button")}</button>
      &nbsp;
      <button onClick={this.deleteAll} className="deleteAll small">{this.gettext("delete_all_button")}</button>
    </div>
  }
  noPendingUploads = () => {
    return (!this.props.pendingUploads || this.props.pendingUploads.length === 0);
  }
  renderPendingUploads = () => {
    var that = this;
    if(this.noPendingUploads()) return <i className="noPendingUploads">{this.gettext("no_pending_uploads")}</i>;
    return <div>
      <h1>{this.gettext('pending_heading')}</h1>
      {this.props.pendingUploads.map(function(item, i){
        return <ExpandCollapse key={item.guid} title={item.title || item.body}>
          <PendingItem {...item} lang={that.props.lang} lastItem={i === that.props.pendingUploads.length - 1}/>
        </ExpandCollapse>
      })}
    </div>
  }
}

export default Pending;
