import React, { useRef } from 'react';
import './FileUpload.css';

function FileUpload({ onFileUpload, loading }) {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('dragover');
  };

  const handleDragLeave = () => {
    dropZoneRef.current?.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className="file-upload"
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Processing file...</p>
        </div>
      ) : (
        <>
          <div className="upload-icon">📁</div>
          <p className="upload-text">Drag and drop your Excel file here</p>
          <p className="upload-subtext">or click to browse</p>
        </>
      )}
    </div>
  );
}

export default FileUpload;
