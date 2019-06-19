import React   from 'react';
import PropTypes              from 'prop-types';
import {PAGE, PAGE_URL}       from '../../constants.js';
import MaharaBaseComponent    from '../base.js';

var menuItems = [
  {menuType: PAGE.USER,    stringId:'menu_user'},
  {menuType: PAGE.ADD,     stringId:'menu_add'},
  {menuType: PAGE.PENDING, stringId:'menu_pending', states: {
    loggedIn: {
      stringId: 'not_syncing',
      imageUrl: 'image/network-access-grey.svg',
    },
      inactive: {
        stringId: 'not_syncing',
        imageUrl: 'image/no-network-access.svg',
      },
      active: {
        stringId: 'currently_syncing',
        imageUrl: 'image/network-access.svg',
      },
    }
  }
];

class NavBar extends MaharaBaseComponent {
  render() {
    var that = this;
    var propsMenuBase = this.getPropsMenuBase();
    return <nav>
        <ul>
          {menuItems.map(function(item, index){
            return <li key={item.menuType} ref={"menu" + item.menuType} className={item.menuType === propsMenuBase ? "active": ""} style={that.renderStyles(item)}>
              <a href={"#" + PAGE_URL[item.menuType]}>
                {that.gettext(item.stringId)}
                {item.menuType === propsMenuBase ? <span className="sr-only"> ({that.gettext('menu_active')})</span>: ""}
                {that.renderBadge(item.menuType)}
              </a>
            </li>;
          })}
        </ul>
        <i className={"navbarActiveHighlight navbarActiveHighlight" + propsMenuBase} ref="navbarActiveHighlight"/>
    </nav>;
  }
  componentDidMount = () => {
    this.moveNavbarActiveHighlight();
    window.addEventListener('resize', this.moveNavbarActiveHighlight);
  }
  componentWillUnmount = () => {
    this.moveNavbarActiveHighlight();
    window.removeEventListener('resize', this.moveNavbarActiveHighlight);
  }
  componentDidUpdate = () => {
    this.moveNavbarActiveHighlight();
  }
  moveNavbarActiveHighlight = () => {
    var propsMenuBase = this.getPropsMenuBase(),
        that = this;
    menuItems.map(function(item, index){
      if(item.menuType === propsMenuBase){
        var liNode = that.refs["menu" + item.menuType],
            liPosition = liNode.getBoundingClientRect();

        that.refs.navbarActiveHighlight.style.left  = liPosition.left + "px";
        that.refs.navbarActiveHighlight.style.width = liPosition.width + "px";
      }
    });
  }
  getPropsMenuBase = () => {
   var propsMenuBase = this.props.page;
   if(propsMenuBase.indexOf("_") >= 0){ // Because top level menu item of ADD should also match
                                        // submenu of ADD_LIBRARY or ADD_JOURNAL_ENTRY etc
     propsMenuBase = propsMenuBase.substr(0, propsMenuBase.indexOf("_"));
   }
   return propsMenuBase;
  }
  renderBadge = (PAGE_ID) => {
    switch(PAGE_ID){
      case PAGE.PENDING:
        if(this.props.pendingUploads && this.props.pendingUploads.length){
          return <span className="badge">{this.props.pendingUploads.length}</span>;
        }
    }
    return "";
  }
  renderStyles = (item) => {
    if(item.menuType !== PAGE.PENDING) return {};
    var activeOrInactive;

    if (this.props.server.wwwroot && this.props.server.wstoken) {
        if (this.props.uploadGuid) {
            activeOrInactive = item.states.active;
        } else {
            activeOrInactive = item.states.loggedIn;
        }
    } else {
        activeOrInactive = item.states.inactive;
    }

    return {backgroundImage: 'url("' + activeOrInactive.imageUrl + '")'};
  }
}

export default NavBar;

NavBar.propTypes = {
  pendingUploads: PropTypes.array.isRequired,
  server: PropTypes.object.isRequired,
  page: PropTypes.string.isRequired,
  uploadGuid: PropTypes.string
};

NavBar.defaultProps = {
  uploadGuid: undefined
};
