import React from 'react';
import PropTypes from 'prop-types';
import MaharaBaseComponent from '../../base.js';
import { PAGE_URL, STORAGE } from '../../../constants.js';
import StateStore, { maharaServer } from '../../../state.js';
import MaharaSelector from '../mahara-selector/selector.js';
import Router from '../../../router.js';

const defaultIcon = "image/profile-default.png";

class SettingsTab extends MaharaBaseComponent {
    constructor() {
        super();

        this.renderServer = this.renderServer.bind(this);
        this.changeServer = this.changeServer.bind(this);

        this.setLanguage = this.setLanguage.bind(this);
        this.setJournal = this.setJournal.bind(this);
        this.setFolder = this.setFolder.bind(this);
    }

    render() {
        let siteName = 'Mahara',
          defaultFolder, defaultJournal, defaultLanguage;

        const { server, lang } = this.props;
        // language select setup
        let langOptions = Object.keys(window.mahara.i18n.strings)
          .map(lang => ({ id: lang, text: lang }));

        if (lang.length && langOptions.length) {
          lang.forEach(lang => {
              if (!defaultLanguage) {
                defaultLanguage =  langOptions.find(language => language.id === lang);
              }
          });
        }

        if (!defaultLanguage) {
          defaultLanguage = {'id': '', 'text': ''};
        }

        // journal select setup
        let journalOptions = server.sync.blogs
          .map(blog => ({ id: blog.id, text: blog.title }));

        if (server.defaultBlogId && journalOptions.length) {
          defaultJournal = journalOptions.find(blog => blog.id === server.defaultBlogId);
        } else {
          defaultJournal = { 'id': '', 'text': '' };
        }

          // folder select setup
          let folderOptions = server.sync.folders
            .map(folder => ({ id: folder.title, text: folder.title }));

          if (server.defaultFolderName && folderOptions.length) {
            defaultFolder = folderOptions.find(folder => folder.id === server.defaultFolderName);
          }

          if (!defaultFolder) {
            defaultFolder = { 'id': STORAGE.DEFAULT_FOLDER, 'text': STORAGE.DEFAULT_FOLDER };
          }

          return <section>
                    <h2>{siteName}</h2>
                    <div className="userInfoBlock">
                      <div className="back">
                        <a onClick={this.props.onGoBack}>{this.gettext("back_to_profile")}</a>
                      </div>
                      {this.renderServer() }
                      <MaharaSelector
                        label={this.gettext("default_journal")}
                        defaultOption={defaultJournal}
                        name="journalSelect"
                        options={journalOptions}
                        onSetSelection={this.setJournal}
                        ></MaharaSelector>

                      <MaharaSelector
                        label={this.gettext("default_language")}
                        defaultOption={defaultLanguage}
                        name="languageSelect"
                        options={langOptions}
                        onSetSelection={this.setLanguage}
                        ></MaharaSelector>

                        <MaharaSelector
                          label={this.gettext("default_folder")}
                          defaultOption={defaultFolder}
                          name="folderSelect"
                          options={folderOptions}
                          onSetSelection={this.setFolder}
                          ></MaharaSelector>
                    </div>
                    <hr/>
                  </section>;
    }

    setLanguage(lang) {
      StateStore.dispatch({ type: STORAGE.SET_USER_LANGUAGE, language: lang });
    }
    setJournal(journal) {
      StateStore.dispatch({ type: STORAGE.SET_DEFAULT_JOURNAL, journal: parseInt(journal, 10) });
    }

    setFolder(folder) {
      StateStore.dispatch({ type: STORAGE.SET_DEFAULT_FOLDER, folder: folder });
    }

    renderServer() {
        if (!this.props.server || !this.props.server.wwwroot) return "";
        return  <div className="setting">
                  <div>
                    <label htmlFor="user-server">{this.gettext("site")}: </label>
                    <div id="user-server">
                      <span>{this.props.server.wwwroot}</span>
                    </div>
                  </div>
                  <button onClick={this.changeServer} className="button change-settings" ></button>
                </div>;
    }

    changeServer() {
        Router.navigate(PAGE_URL.SERVER);
    }
}

export default SettingsTab;

SettingsTab.propTypes = {
  server: PropTypes.object.isRequired
};
