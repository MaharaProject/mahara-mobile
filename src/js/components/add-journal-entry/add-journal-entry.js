import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent    from '../base.js';
import Router                 from '../../router.js';
import StateStore,
{maharaServer}                from '../../state.js';
import JournalEntry           from './journal-entry.js';
import {JOURNAL, PAGE_URL}    from '../../constants.js';

class AddJournalEntry extends MaharaBaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            targetBlogId: this.props.guid ? this.props.targetBlogId : this.props.server.defaultBlogId
        };

        this.changeJournal = this.changeJournal.bind(this);
    }

    render() {
        var pageTitle = this.gettext("add_journal_title");
        var journalParams = {};
        if (this.props.journalToEdit && Array.isArray(this.props.pendingUploads)) {
            // Find the journal
            for (var i = 0; i < this.props.pendingUploads.length; i++) {
                if (this.props.pendingUploads[i].guid === this.props.journalToEdit) {
                    let journal = this.props.pendingUploads[i];
                    journalParams.title = journal.title;
                    journalParams.body = journal.body;
                    journalParams.tags = journal.tags;
                    journalParams.targetBlogId = journal.targetBlogId;
                    journalParams.guid = this.props.journalToEdit;
                    pageTitle = this.gettext("edit_journal_title");
                    break;
                }
            }
        }
        return <section>
            <h1>{pageTitle}</h1>
            <JournalEntry {...this.props} {...journalParams} ref="journalEntry" onChangeJournal={this.changeJournal}/>
            <button ref="saveButton" onClick={this.saveButton}>{this.gettext("add_journal_save_button") }</button>
        </section>;
    }

    saveButton = () => {
        var titlebox = this.refs.journalEntry.refs.title,
            textarea = this.refs.journalEntry.refs.textarea,
            tags = this.refs.journalEntry.tags,
            targetBlogId = this.state.targetBlogId,
            journalEntry;

        journalEntry = {
            type: JOURNAL.TYPE,
            title: titlebox.value,
            body: textarea.value,
            tags: tags,
            targetBlogId: targetBlogId
        };

        if (!journalEntry.title || !journalEntry.body) {
            alertify
                .okBtn(this.gettext("alert_ok_button"))
                .alert(this.gettext("add_journal_required"));
            return;
        }

        var guid;
        var type;
        if (this.refs.journalEntry.guid) {
            // Editing an existing journal in the pending list
            journalEntry.guid = this.refs.journalEntry.guid;
            type = JOURNAL.EDIT_ENTRY;
        }
        else {
            // Adding a new journal entry to the pending list
            journalEntry.guid = this.guidGenerator();
            journalEntry.createdOn = Date.now();
            type = JOURNAL.ADD_ENTRY;
        }

        StateStore.dispatch({ type: type, journalEntry: journalEntry });
        Router.navigate(PAGE_URL.PENDING);
    }
    guidGenerator() {
        return (Math.random() + 1).toString(36).substring(2, 12) + (Math.random() + 1).toString(36).substring(2, 12);
    }

    changeJournal(targetBlogId) {
        this.setState({'targetBlogId': targetBlogId});
    }
}

export default AddJournalEntry;

AddJournalEntry.propTypes = {
  server: PropTypes.object.isRequired,
  pendingUploads: PropTypes.array.isRequired,
  guid: PropTypes.string,
  targetBlogId: PropTypes.number,
  journalToEdit: PropTypes.string,
};

AddJournalEntry.defaultProps = {
  guid: undefined,
  targetBlogId: undefined,
  journalToEdit: ""
};
