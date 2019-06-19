import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent from '../base.js';
import Select, { Creatable } from 'react-select';
import { setTextareaHeight } from '../../util';

class JournalEntry extends MaharaBaseComponent {
    constructor(props) {
        super(props);
        let userTags = props.server.sync.tags.map(tag => tag.tag);

        if (props.guid) {
            this.guid = props.guid;
            this.tags = this.props.tags;
        } else {
          this.tags = [];
        }

        this.state = {
            userTags: userTags,
            selectedTags: props.guid ? props.tags : [],
            targetBlogId: props.guid ? props.targetBlogId : this.props.server.defaultBlogId
        };

        this.changeTagsOnBlur = this.changeTagsOnBlur.bind(this);
        this.changeTags = this.changeTags.bind(this);
        this.changeJournal = this.changeJournal.bind(this);
    }
    render() {
        const { title, body, server } = this.props;

        let blogOptions = server.sync.blogs
          .map(blog => ({ value: blog.id, label: blog.title }));

        let tagsOptions = this.state.userTags.concat(this.state.selectedTags)
          .filter((tag, id, tags) => tags.indexOf(tag) === id) // make unique
          .map(tag => ({ value: tag, label: tag }));

        return <div>
            <h2>{this.gettext('library_title')}</h2>
            <input ref="title" type="text" className="subject" defaultValue={title} />
            <h2>{this.gettext('library_body')}</h2>
            <textarea ref="textarea" className="body" defaultValue={body} />
            <h2>{this.gettext('library_tags')}</h2>
              <Creatable
                multi={true}
                value={this.state.selectedTags}
                onChange={this.changeTags}
                onBlur={this.changeTagsOnBlur}
                clearable={false}
                options={tagsOptions}
              />
            {server.sync.blogs.length < 2 ? null :
              <div>
                  <h2>{this.gettext('library_blog')}</h2>
                    <Select
                      value={this.state.targetBlogId}
                      onChange={this.changeJournal}
                      clearable={false}
                      options={blogOptions}
                    />
              </div>
            }
        </div>;
    }
    changeTags(tagsObj) {
      this.setState({ selectedTags: tagsObj.map(t => t.label) });
      // parent component accesses it this way
      this.tags = tagsObj.map(t => t.label);
    }
    changeTagsOnBlur(e) {
      let newTags = this.state.selectedTags.slice(0); // copy array
      newTags.push(e.target.value);

      this.setState({ selectedTags: newTags });
      this.tags = newTags;
    }

    changeJournal(newJournal) {
        this.setState({ targetBlogId: newJournal.value });
        this.props.onChangeJournal(newJournal.value);
    }

    componentDidMount() {
      setTextareaHeight(this.refs.textarea);
    }
}

export default JournalEntry;

JournalEntry.propTypes = {
  server: PropTypes.object.isRequired,
  onChangeJournal: PropTypes.func.isRequired,
  guid: PropTypes.string,
  title: PropTypes.string,
  body: PropTypes.string,
  targetBlogId: PropTypes.number,
  tags: PropTypes.array,
};

JournalEntry.defaultProps = {
  guid: undefined,
  title: undefined,
  body: undefined,
  targetBlogId: undefined,
  tags: [],
};
