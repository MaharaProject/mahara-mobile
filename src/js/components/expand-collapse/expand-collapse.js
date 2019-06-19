import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent    from '../base.js';

class ExpandCollapse extends MaharaBaseComponent {
  constructor(props) {
    super(props);
    this.state = {hidden: true};
  }
  render() {
    return (<div className={"expandCollapse " + (this.state.hidden ? "hidden" : "visible")}>
              <button onClick={this.toggle}>
                {this.state.hidden ? '\u2227': '\u2228'}
              </button>
              {this.state.hidden && this.props.title ? <a onClick={this.toggle} className="summary"> {this.props.title} </a> : ""}
              {this.state.hidden ? "" : this.props.children}
              <div className={this.props.loading ? "loading" : ""}>
                <span className="loading-ptr-1"></span>
                <span className="loading-ptr-2"></span>
                <span className="loading-ptr-3"></span>
              </div>
            </div>);
  }
  toggle = () => {
    this.setState({hidden: !this.state.hidden});
  }
}

export default ExpandCollapse;

ExpandCollapse.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
  loading: PropTypes.bool
};
