import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent    from '../base.js';
import StateStore,
{maharaServer}                from '../../state.js';
import Router                 from '../../router.js';
import {PAGE_URL,
    LOGIN_TYPE,
    STORAGE,
    LOGIN}                    from '../../constants.js';

class LoginTypePage extends MaharaBaseComponent {

    render() {
        if (!this.props.server || !this.props.server.wwwroot) {
            return <section>
                <button onClick={this.changeServer} className="changeServer">{this.gettext('login_type_error_choose_server') }</button>
            </section>;
        } else {
            return <section>
                <p className="textLinks">{this.props.server.wwwroot} <a onClick={this.changeServer} className="changeServer">{this.gettext('change') }</a></p>
                <h2>{this.gettext('login_types_header') }</h2>
                {this.supportsSingleSignOn() }
                {this.supportsLocalLogin() }
                {this.supportsManualToken() }
            </section>;
        }
    }

    changeServer = (e) => {
        e.preventDefault();
        Router.navigate(PAGE_URL.SERVER);
    };

    supportsSingleSignOn = () => {
        if (this.props.server && this.props.server.loginTypes && this.props.server.loginTypes.indexOf(LOGIN_TYPE.SINGLE_SIGN_ON) === -1) return "";
        return <button onClick={this.sso} className="loginType"><abbr title="Single Sign-on">{this.gettext("single_sign_on") }</abbr></button>;
    };

    supportsLocalLogin = () => {
        if (this.props.server && this.props.server.loginTypes && this.props.server.loginTypes.indexOf(LOGIN_TYPE.LOCAL) === -1) return "";
        return <button onClick={this.local} className="loginType">{this.gettext("local_username_password") }</button>;
    };

    supportsManualToken = () => {
        if (this.props.server.loginTypes.indexOf(LOGIN_TYPE.MANUAL_TOKEN) === -1) return "";
        return <button onClick={this.manualTokenEntry} className="loginType">{this.gettext("login_manual_token_entry") }</button>;
    };

    sso = (e) => {
        maharaServer.openSsoWindow(this.ssoSuccess);
    };

    ssoSuccess = (wstoken) => {
        StateStore.dispatch({
            type: LOGIN.AFTER_LOGIN_GET_PROFILE,
            wstoken: wstoken
        });
        Router.navigate(PAGE_URL.ADD);
    }

    local = (e) => {
        Router.navigate(PAGE_URL.LOGIN);
    }

    manualTokenEntry = (e) => {
        Router.navigate(PAGE_URL.TOKEN_ENTRY);
    }
}

export default LoginTypePage;

LoginTypePage.propTypes = {
  server: PropTypes.object.isRequired
};
