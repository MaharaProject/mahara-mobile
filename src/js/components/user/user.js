import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent  from '../base.js';
import { PAGE_URL, STORAGE } from '../../constants.js';
import StateStore, { maharaServer } from '../../state.js';
import Router               from '../../router.js';
import ReactPullToRefresh   from 'react-pull-to-refresh';
import MaharaSelector       from './mahara-selector/selector.js';

import SettingsTab          from './settings/settings-tab.js';
import MainTab              from './main/main-tab.js';

const defaultIcon = "image/profile-default.png";
const defaultTab = 'main';

class User extends MaharaBaseComponent {
    constructor(props) {
        super(props);


        this.state = {
          'activeTab': props.server.profile.id ? 'main' : 'login'
        };

        this.logoutButton = this.logoutButton.bind(this);
        this.loginButton = this.loginButton.bind(this);
        this.logout = this.logout.bind(this);

        this.showSettings = this.showSettings.bind(this);
        this.hideSettings = this.hideSettings.bind(this);
    }

    componentWillReceiveProps() {
      // if we receive a profile but still on login tab -> change to main tab
      if (this.state.activeTab === 'login' && this.props.server.profile.id) {
        this.setState({'activeTab': 'main'});
      }
    }

    render() {
      let activeTab, siteName, icon, displayName;

      siteName = 'Mahara';

        if (this.props.server) {
          siteName = this.props.server.siteName || 'Mahara';

          if (this.props.server.profile) {
            icon = this.props.server.profile.iconurl || defaultIcon;
            displayName = this.props.server.profile.myname || "";
          }
        } else {
            siteName = `(${this.gettext('offline')})`;
            icon = defaultIcon;
            displayName = "";
        }

        // select tab to display
        switch (this.state.activeTab) {
          case 'settings':
            activeTab = <SettingsTab server={this.props.server} onGoBack={this.hideSettings} lang={this.props.lang}></SettingsTab>;
          break;
          case 'main':
            activeTab = <ReactPullToRefresh onRefresh={maharaServer.refreshUserProfile}><MainTab
                          siteName={siteName}
                          displayName={displayName}
                          icon={icon}
                          onShowSettings={this.showSettings}
                          lang={this.props.lang}
                        ></MainTab></ReactPullToRefresh>;
          break;
          default:
            activeTab = <section>
                          <button onClick={this.loginButton} className="big login">{this.gettext('wizard_login_button') }</button>
                        </section>
                        ;
        }

        return activeTab;
    }

    showSettings() {
      this.setState({ 'activeTab': 'settings' });
    }

    hideSettings() {
      this.setState({ 'activeTab': 'main' });
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

    loginButton() {
      this.logout();
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

export default User;

User.propTypes = {
  server: PropTypes.object.isRequired
};
