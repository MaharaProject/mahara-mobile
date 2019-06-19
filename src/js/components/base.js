import React   from 'react';
import PropTypes              from 'prop-types';
import { getLangString }          from '../i18n.js';
import { STORAGE } from '../constants.js';

export default class MaharaBaseComponent extends React.Component {
  gettext(langStringId){
    if(!this.props.lang){
      console.log("lang", this.props.lang, langStringId);
    }
    var langString = getLangString(this.props.lang, langStringId);
    if(langString !== undefined){
      return langString;
    }
    return "{i18n:" + langStringId + "}";
  }
}

MaharaBaseComponent.propTypes = {
  lang: PropTypes.array
};

MaharaBaseComponent.defaultProps = {
  lang: [STORAGE.DEFAULT_LANGUAGE]
};
