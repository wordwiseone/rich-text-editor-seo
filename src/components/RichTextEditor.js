import React, { useState } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, Modifier } from 'draft-js';
import { Helmet } from 'react-helmet';
import 'draft-js/dist/Draft.css';
import { convertToHTML } from 'draft-convert';

const RichTextEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const onBoldClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  const onItalicClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  const onUnderlineClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
  const onHeaderClick = () => setEditorState(RichUtils.toggleBlockType(editorState, 'header-one'));
  const onUnorderedListClick = () => setEditorState(RichUtils.toggleBlockType(editorState, 'unordered-list-item'));
  const onOrderedListClick = () => setEditorState(RichUtils.toggleBlockType(editorState, 'ordered-list-item'));

  const addLink = () => {
    const url = prompt('Enter a URL');
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url });
    const contentStateWithLink = Modifier.applyEntity(contentStateWithEntity, selection, contentStateWithEntity.getLastCreatedEntityKey());
    setEditorState(EditorState.push(editorState, contentStateWithLink, 'apply-entity'));
  };

  const addImage = () => {
    const url = prompt('Enter an image URL');
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src: url });
    const newState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    setEditorState(newState);
  };

  const getEditorContentAsText = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    const blocks = rawContentState.blocks;
    const text = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
    return text;
  };

  const getEditorContentAsHTML = () => {
    return convertToHTML(editorState.getCurrentContent());
  };

  return (
    <div>
      <Helmet>
        <title>{getEditorContentAsText().substring(0, 60)}</title>
        <meta name="description" content={getEditorContentAsText().substring(0, 160)} />
      </Helmet>
      <div>
        <button onClick={onBoldClick}>Bold</button>
        <button onClick={onItalicClick}>Italic</button>
        <button onClick={onUnderlineClick}>Underline</button>
        <button onClick={onHeaderClick}>Header</button>
        <button onClick={onUnorderedListClick}>Unordered List</button>
        <button onClick={onOrderedListClick}>Ordered List</button>
        <button onClick={addLink}>Add Link</button>
        <button onClick={addImage}>Add Image</button>
      </div>
      <div style={{ border: '1px solid #000', padding: '10px', minHeight: '200px' }}>
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
        />
      </div>
      <div>
        <h3>Generated HTML:</h3>
        <div dangerouslySetInnerHTML={{ __html: getEditorContentAsHTML() }} />
      </div>
    </div>
  );
};

export default RichTextEditor;
