import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent  from '../base.js';
import StateStore,
{maharaServer}              from '../../state.js';
import Router               from '../../router.js';
import {PAGE,
    LOGIN,
    PAGE_URL,
    STORAGE}                from '../../constants.js';

class TokenPage extends MaharaBaseComponent {

    render() {
        return <section>
            <p className="textLinks">
                {this.props.server && this.props.server.wwwroot ? this.props.server.wwwroot : ""}
                <button onClick={this.backButton} className="changeServer">{this.gettext('change') }</button>
            </p>
            <p className="helpText">{this.gettext('token_page_instructions') }</p>
            <label htmlFor="token">{this.gettext('token_field_label') }</label>
            <input type="text" ref="token" id="token"/>
            <button onClick={this.nextButton} className="next">{this.gettext('token_button') }</button>
        </section>;
    }

    componentWillMount() {
        if (!this.props.server.wwwroot) {
            alertify.okBtn(this.gettext("alert_ok_button")).alert(this.gettext("cant_login_no_server_configured"), function () {
                Router.navigate(PAGE_URL.SERVER);
            });
        }
    }
    backButton = (e) => {
        Router.navigate(PAGE_URL.SERVER);
    }
    nextButton = (e) => {
        var that = this;
        var token = this.refs.token.value;
        if (token.trim().length === 0) {
            alertify.okBtn(this.gettext("alert_ok_button")).alert(this.gettext("token_empty_validation"));
            return;
        }

        StateStore.dispatch(
            {
                type: STORAGE.SET_MANUAL_TOKEN,
                wstoken: token
            }
        );
    }
}

export default TokenPage;

TokenPage.propTypes = {
  server: PropTypes.object.isRequired
};
