import React   from 'react';
import PropTypes              from 'prop-types';
import MaharaBaseComponent from '../../base.js';
import StateStore,
       {maharaServer}      from '../../../state.js';
import {STORAGE, PAGE_URL} from '../../../constants.js';
import Router              from '../../../router.js';
import Select from 'react-select';


export default class MaharaSelector extends MaharaBaseComponent {

  constructor(props) {
    super(props);

    this.state = {
      isEditable: false,
      selection: this.props.defaultOption ? this.props.defaultOption.id : null
    };

    this.setSelection = this.setSelection.bind(this);
    this.makeEditable = this.makeEditable.bind(this);
    this.selectionChanged = this.selectionChanged.bind(this);
  }

  render() {
      if (this.state.isEditable) {
          return <div className="setting">
                  <div>
                    <label htmlFor={this.props.name}>{this.props.label}:</label>
                      <Select
                        value={this.state.selection}
                        onChange={this.selectionChanged}
                        labelKey="text"
                        valueKey="id"
                        clearable={false}
                        options={this.props.options}
                      />
                  </div>
                <button onClick={this.setSelection} className="btn save"></button>
              </div>;
      } else {
        return  <div className="setting">
                  <div>
                    <label htmlFor={this.props.name}>{this.props.label}:&nbsp;</label>
                    <div id={this.props.name}>{this.props.defaultOption.text}</div>
                  </div>
                  <button onClick={this.makeEditable} className="btn change-settings"></button>
                </div>;
      }
  }

  selectionChanged(selection) {
    this.setState({ 'selection': selection.id });
  }

  setSelection() {
    if (!this.state.selection &&
        (!this.props.defaultOption || !this.props.defaultOption.id) &&
        this.props.options.length) {
      this.props.onSetSelection(this.props.options[0].id);
    } else {
      this.props.onSetSelection(this.state.selection);
    }
    this.setState({ isEditable: false });
  }

  makeEditable() {
      this.setState({ isEditable: true });
  }

}

MaharaSelector.propTypes = {
  label: PropTypes.string,
  defaultOption: PropTypes.object.isRequired,
  name: PropTypes.string,
  options: PropTypes.array,
  onSetSelection: PropTypes.func
};
