import React, { useRef, useState } from 'react'
import './UploadArea.css'

const UploadArea = ({ onFileUpload, disabled }) => {
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const validateFile = (file) => {
    // Validar tipo de arquivo
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    const allowedExtensions = ['.csv', '.xls', '.xlsx']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'Tipo de arquivo não suportado' }
    }
    
    // Validar tamanho (40MB limite)
    const maxSize = 40 * 1024 * 1024 // 40MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande (máximo 40MB)' }
    }
    
    return { valid: true }
  }

  const processFile = async (file) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // Adicionar arquivo à lista com status "processing"
    const fileId = Date.now() + Math.random()
    const newFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      status: 'processing',
      progress: 0
    }
    
    setUploadedFiles(prev => [...prev, newFile])
    
    // Simular processamento com progresso
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: i }
            : f
        )
      )
    }
    
    // Atualizar status para "completed"
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      )
    )
    
    // Chamar callback de upload
    if (onFileUpload) {
      onFileUpload(file)
    }
  }

  const handleFileSelect = (file) => {
    if (!file) return
    processFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files)
    
    if (files.length === 0) return
    
    // Processar múltiplos arquivos
    files.forEach(file => {
      processFile(file)
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      processFile(file)
    })
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const clearAllFiles = () => {
    setUploadedFiles([])
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="upload-section">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Upload de Dados</h2>
          <p className="card-subtitle">
            Carregue arquivos CSV ou Excel para análise de dados
          </p>
        </div>
        
        <div 
          className={`upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            multiple
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />
          
          <div className="upload-content">
            <div className="upload-icon">
              {disabled ? '⏳' : isDragOver ? '📂' : '📁'}
            </div>
            
            <h3 className="upload-title">
              {disabled ? 'Processando...' : isDragOver ? 'Solte os arquivos aqui' : 'Arraste e solte ou clique para selecionar (múltiplos arquivos)'}
            </h3>
            
            <p className="upload-subtitle">
              {disabled 
                ? 'Aguarde o processamento do arquivo' 
                : 'Formatos suportados: CSV, XLS, XLSX (máx. 50MB)'
              }
            </p>
            
            {!disabled && (
              <button className="btn btn-primary btn-lg">
                Selecionar Arquivo
              </button>
            )}
          </div>
        </div>

        {/* Lista de arquivos */}
        {uploadedFiles.length > 0 && (
          <div className="file-list">
            <div className="file-list-header">
              <h4>📋 Arquivos Carregados ({uploadedFiles.length})</h4>
              <button 
                className="clear-all-button"
                onClick={clearAllFiles}
                disabled={isProcessing}
              >
                🗑️ Limpar Todos
              </button>
            </div>
            <div className="file-items">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      {file.status === 'processing' ? '⏳' : 
                       file.status === 'completed' ? '✅' : '📄'}
                    </div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  
                  {file.status === 'processing' && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="file-actions">
                    {file.status === 'completed' && (
                      <button 
                        className="remove-file-button"
                        onClick={() => removeFile(file.id)}
                        title="Remover arquivo"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="upload-info">
          <h4>📋 Instruções:</h4>
          <ul>
            <li>Arquivos CSV devem ter cabeçalhos na primeira linha</li>
            <li>Arquivos Excel devem ter dados na primeira planilha</li>
            <li>Tamanho máximo: 50MB</li>
            <li>Colunas esperadas: Data, Operador, Tempo de Atendimento, Avaliações, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UploadArea
