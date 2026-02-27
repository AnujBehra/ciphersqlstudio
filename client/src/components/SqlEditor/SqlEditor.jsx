import Editor from '@monaco-editor/react';
import './SqlEditor.scss';

const SqlEditor = ({ value, onChange, onExecute, isExecuting }) => {
  const handleEditorMount = (editor, monaco) => {
    // Add keyboard shortcut: Ctrl/Cmd + Enter to execute
    editor.addAction({
      id: 'execute-query',
      label: 'Execute Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        onExecute();
      },
    });
  };

  return (
    <div className="sql-editor">
      <div className="sql-editor__header">
        <h3 className="sql-editor__title">✏️ SQL Editor</h3>
        <div className="sql-editor__actions">
          <span className="sql-editor__shortcut">⌘+Enter to run</span>
          <button
            className="sql-editor__run-btn"
            onClick={onExecute}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <span className="sql-editor__spinner" />
                Running...
              </>
            ) : (
              <>▶ Execute</>
            )}
          </button>
        </div>
      </div>
      <div className="sql-editor__editor-wrapper">
        <Editor
          height="250px"
          language="sql"
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12 },
            suggest: {
              showKeywords: true,
            },
          }}
        />
      </div>
    </div>
  );
};

export default SqlEditor;
