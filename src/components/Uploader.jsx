// v2.0.0 - Uploader Melhorado
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useData } from '../context/DataContext';
import { processarPlanilha } from '../utils/dataParser';

function Uploader() {
  const { setRawData, setOperadores } = useData();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileBuffer = event.target.result;
        const { atendimentos, operadores } = processarPlanilha(fileBuffer);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setRawData(atendimentos);
          setOperadores(operadores);
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      };
      reader.readAsArrayBuffer(file);

    } catch (error) {
      console.error('Erro ao processar planilha:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [setRawData, setOperadores]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div className="velohub-container fade-in">
      <div className="upload-section">
        <div className="upload-header">
          <div className="upload-icon gradient-primary">
            📁
          </div>
          <h2 className="text-gradient">Upload de Planilha</h2>
          <p>Faça upload da sua planilha de atendimentos para começar a análise</p>
        </div>

        <div 
          {...getRootProps()} 
          className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="upload-progress">
              <div className="progress-circle">
                <div className="progress-fill" style={{ transform: `rotate(${uploadProgress * 3.6}deg)` }}></div>
                <span className="progress-text">{uploadProgress}%</span>
              </div>
              <p>Processando planilha...</p>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon-large">
                {isDragActive ? '📂' : '📄'}
              </div>
              <h3>
                {isDragActive ? 'Solte a planilha aqui' : 'Arraste e solte sua planilha'}
              </h3>
              <p>ou clique para selecionar</p>
              <div className="upload-formats">
                <span className="format-tag">.xlsx</span>
                <span className="format-tag">.csv</span>
                <span className="format-tag">.xls</span>
              </div>
            </div>
          )}
        </div>

        <div className="upload-features">
          <div className="feature-item hover-lift">
            <div className="feature-icon gradient-success">⚡</div>
            <h4>Processamento Rápido</h4>
            <p>Análise instantânea dos dados</p>
          </div>
          <div className="feature-item hover-lift">
            <div className="feature-icon gradient-secondary">📊</div>
            <h4>Dashboard Completo</h4>
            <p>Gráficos e métricas detalhadas</p>
          </div>
          <div className="feature-item hover-lift">
            <div className="feature-icon gradient-primary">🔍</div>
            <h4>Análise Individual</h4>
            <p>Performance por operador</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Uploader;
