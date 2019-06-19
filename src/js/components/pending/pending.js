import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent  from '../base.js';
import ExpandCollapse       from '../expand-collapse/expand-collapse.js';
import StateStore           from '../../state.js';
import {PENDING, PAGE_URL}  from '../../constants.js';
import PendingItem          from './pending-item.js';
import Router               from '../../router.js';

class Pending extends MaharaBaseComponent {
    constructor() {
        super();
        this.deleteAll = this.deleteAll.bind(this);
        this.uploadAll = this.uploadAll.bind(this);
        this.renderButtonTray = this.renderButtonTray.bind(this);
    }

    render() {
        return <section>
            {this.renderPendingUploads() }
            {this.renderButtonTray() }
        </section>;
    }

    deleteAll() {
        var reallyDeleteAll = function () {
            StateStore.dispatch({ type: PENDING.DELETE_ALL });
        };
        alertify.okBtn(this.gettext("confirm_delete_all_ok_button"))
            .cancelBtn(this.gettext("button_cancel"))
            .confirm(this.gettext("confirm_delete_all"), reallyDeleteAll);
    }

    uploadAll() {
        var journalEntry,
            that = this,
            dontReattemptUploadWithinMilliseconds = 1000 * 60 * 10;

        if (!this.props.pendingUploads || this.props.pendingUploads.length === 0) return;

        // if user not loged in redirect to server setup....
        if (!this.props.server.wwwroot || !this.props.server.wstoken) {
          alertify.okBtn(this.gettext("alert_ok_button")).alert(this.gettext("cant_login_no_server_configured"), function () {
              Router.navigate(PAGE_URL.SERVER);
          });
        } else {
          StateStore.dispatch({ type: PENDING.UPLOAD_NEXT });
        }
    }

    renderButtonTray() {
        if (this.noPendingUploads()) return "";
        return <div className="buttonTray">
            <button onClick={this.uploadAll} className="uploadAll small">{this.gettext("upload_all_button") }</button>
        </div>;

        // &nbsp;
        // <button onClick={this.deleteAll} className="deleteAll small">{this.gettext("delete_all_button")}</button>
    }

    noPendingUploads = () => {
        return (!this.props.pendingUploads || this.props.pendingUploads.length === 0);
    }

    renderPendingUploads = () => {
        var that = this;
        if (this.noPendingUploads()) return <i className="noPendingUploads">{this.gettext("no_pending_uploads") }</i>;
        return <div>
            <h1>{this.gettext('pending_heading') }</h1>
            {
                this.props.pendingUploads.map(function (item, i) {
                    return <ExpandCollapse key={item.guid} title={item.title || item.body} loading={item.loading}>
                        <PendingItem {...item} lang={that.props.lang} lastItem={i === that.props.pendingUploads.length - 1}/>
                    </ExpandCollapse>;
                })
            }
        </div>;
    }
}

export default Pending;

Pending.propTypes = {
  pendingUploads: PropTypes.array.isRequired,
  server: PropTypes.object.isRequired,
  lang: PropTypes.array.isRequired
};
