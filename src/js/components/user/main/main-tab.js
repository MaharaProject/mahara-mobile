import React from 'react';
import PropTypes  from 'prop-types';
import MaharaBaseComponent  from '../../base.js';
import { PAGE_URL, STORAGE } from '../../../constants.js';
import Router from '../../../router.js';
import StateStore, { maharaServer } from '../../../state.js';
import ReactPullToRefresh from 'react-pull-to-refresh';
import MaharaSelector from '../mahara-selector/selector.js';

const defaultIcon = "image/profile-default.png";

class MainTab extends MaharaBaseComponent {
    constructor() {
        super();

        this.logoutButton = this.logoutButton.bind(this);
        this.logout = this.logout.bind(this);

        this.showSettings = this.showSettings.bind(this);
    }

    render() {
      return <section>
              <h2>{this.props.siteName}</h2>
              <div className="userBlock">
                <img src={this.props.icon} className="profile"/>
                <div className="username">{this.props.displayName}</div>
                <a onClick={this.props.onShowSettings} className="tab-nav settings">{this.gettext('default_settings')}</a>
                <a onClick={this.logoutButton} className="tab-nav logout">{this.gettext("logout_button") }</a>
              </div>
            </section>
      ;
    }

    showSettings() {
      this.setState({ 'activeTab': 'settings' });
    }

    logoutButton() {
        alertify.okBtn(this.gettext("alert_ok_button"));
        alertify.cancelBtn(this.gettext("button_cancel"));
        alertify.confirm(this.gettext("logout_confirmation"), (e, str) => {
            if (e) {
              this.logout();
            } else {
                //nothing
            }
        });
    }

    logout() {
      maharaServer.logOut(function (isLoggedIn) {
          // console.log("Is logged in?", isLoggedIn);
          Router.navigate(PAGE_URL.SERVER);
      }, function (err) {
          console.log("Couldn't logout. This probably doesn't matter.", err);
          Router.navigate(PAGE_URL.SERVER);
      });
    }
}

export default MainTab;

MainTab.propTypes = {
  icon: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  onShowSettings: PropTypes.func.isRequired
};
