import React, { Component } from 'react'
import RichTextEditor from 'react-rte'
import styles from './RichtextEditor.module.css'

const toolbarConfig = {
  // Optionally specify the groups to display (displayed in the order listed).
  display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
  INLINE_STYLE_BUTTONS: [
    {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
    {label: 'Italic', style: 'ITALIC'},
    // {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Code', style: 'CODE'}
  ],
  BLOCK_TYPE_DROPDOWN: [
    {label: 'Normal', style: 'unstyled'},
    {label: 'Code Block', style: 'code-block'}
  ],
  BLOCK_TYPE_BUTTONS: [
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'}
  ]
}

class MyStatefulEditor extends Component {
  state = {
    value: RichTextEditor.createValueFromString(this.props.value, 'markdown')
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      const newValue = RichTextEditor.createValueFromString(this.props.value, 'markdown')

      if (newValue._cache.markdown !== this.state.value._cache.markdown) {
        this.setState({
          value: RichTextEditor.createValueFromString(this.props.value, 'markdown')
        });
      }
    }
  }

  onChange = (value) => {
    this.setState({ value })
    if (this.props.handleChange) {
      // Send the changes up to the parent component as an HTML string.
      // This is here to demonstrate using `.toString()` but in a real app it
      // would be better to avoid generating a string on each change.
      this.props.handleChange(
        value.toString('markdown')
      );
    }
  };

  render () {
    return (
      <RichTextEditor
        value={this.state.value}
        onChange={this.onChange}
        toolbarConfig={toolbarConfig}
        placeholder={this.props.placeholder}
        onBlur={this.props.onBlur}
        className={styles.editor}
      />
    );
  }
}

export default MyStatefulEditor
