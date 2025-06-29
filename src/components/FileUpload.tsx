import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { TSPService } from '../services/tspService';
import type { UploadResponse } from '../types/tsp';

interface FileUploadProps {
  onUploadSuccess: (result: UploadResponse) => void;
  onUploadError: (error: string) => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  isUploading,
  setIsUploading,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      onUploadError('No valid file selected');
      return;
    }

    const file = acceptedFiles[0];
    
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      onUploadError('Please upload a .txt or .csv file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onUploadError('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      
      // Validate file content before uploading
      const content = await file.text();
      const validation = TSPService.validateCoordinateFile(content);
      
      if (!validation.isValid) {
        onUploadError(validation.error || 'Invalid file format');
        return;
      }

      const result = await TSPService.uploadFile(file);
      onUploadSuccess(result);
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess, onUploadError, setIsUploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive || dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="text-6xl text-gray-400">
            📁
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-600">
                Uploading and validating...
              </div>
              <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your file here' : 'Upload coordinate file'}
              </div>
              <div className="text-sm text-gray-500">
                Drag & drop a .txt or .csv file, or click to browse
              </div>
              <div className="text-xs text-gray-400">
                Format: x,y coordinates (one per line)
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <h4 className="font-medium mb-2">File Requirements:</h4>
        <ul className="space-y-1 text-xs">
          <li>• Format: x,y coordinates (one per line)</li>
          <li>• Minimum: 3 points</li>
          <li>• Maximum: 1000 points</li>
          <li>• File size: Up to 10MB</li>
          <li>• Supported formats: .txt, .csv</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;