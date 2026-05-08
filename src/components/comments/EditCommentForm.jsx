import React, { useState, memo } from 'react'

const EditCommentForm = memo(({ initialContent, onSave, onCancel }) => {
  const [content, setContent] = useState(initialContent)

  return (
    <div className="edit-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="3"
        autoFocus
      />
      <div className="edit-actions">
        <button className="save-btn" onClick={() => onSave(content)}>
          Save
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
      
      <style jsx>{`
        .edit-form textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccd0d5;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          margin-bottom: 8px;
        }
        
        .edit-actions {
          display: flex;
          gap: 8px;
        }
        
        .edit-actions button {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }
        
        .save-btn {
          background: #1877f2;
          color: white;
        }
        
        .cancel-btn {
          background: #e4e6eb;
          color: #050505;
        }
      `}</style>
    </div>
  )
})

EditCommentForm.displayName = 'EditCommentForm'

export default EditCommentForm