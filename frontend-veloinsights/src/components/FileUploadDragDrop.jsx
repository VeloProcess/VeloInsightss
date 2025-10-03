import React, { useState, useRef } from 'react'
import './FileUploadDragDrop.css'

const FileUploadDragDrop = ({ onFileUpload, acceptedTypes = ['.csv', '.xlsx', '.xls'] }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    processFiles(files)
  }

  const processFiles = async (files) => {
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase()
      return acceptedTypes.includes(extension)
    })

    if (validFiles.length === 0) {
      alert(`Por favor, selecione apenas arquivos: ${acceptedTypes.join(', ')}`)
      return
    }

    setIsUploading(true)
    
    try {
      const processedFiles = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        status: 'processing'
      }))

      setUploadedFiles(prev => [...prev, ...processedFiles])

      // Simular processamento
      for (let i = 0; i < processedFiles.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === processedFiles[i].id 
              ? { ...file, status: 'completed' }
              : file
          )
        )
      }

      // Chamar callback com os arquivos processados
      if (onFileUpload) {
        onFileUpload(validFiles)
      }

    } catch (error) {
      console.error('Erro ao processar arquivos:', error)
      alert('Erro ao processar arquivos. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return '⏳'
      case 'completed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '📁'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'processing':
        return 'Processando...'
      case 'completed':
        return 'Concluído'
      case 'error':
        return 'Erro'
      default:
        return 'Pendente'
    }
  }

  return (
    <div className="file-upload-drag-drop">
      <div className="upload-header">
        <h3>📁 Upload de Arquivos</h3>
        <p>Arraste arquivos ou clique para selecionar</p>
        <div className="accepted-types">
          Tipos aceitos: {acceptedTypes.join(', ')}
        </div>
      </div>

      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <div className="upload-icon">
            {isUploading ? '⏳' : isDragOver ? '📂' : '📁'}
          </div>
          <h4>
            {isUploading 
              ? 'Processando arquivos...' 
              : isDragOver 
                ? 'Solte os arquivos aqui' 
                : 'Arraste arquivos aqui'
            }
          </h4>
          <p>
            {isUploading 
              ? 'Aguarde enquanto processamos seus arquivos' 
              : 'ou clique para selecionar'
            }
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {!isUploading && (
            <button 
              className="select-files-button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Selecionar Arquivos
            </button>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <div className="files-header">
            <h4>Arquivos Carregados ({uploadedFiles.length})</h4>
            <button 
              className="clear-all-button"
              onClick={clearAllFiles}
            >
              🗑️ Limpar Todos
            </button>
          </div>
          
          <div className="files-list">
            {uploadedFiles.map(file => (
              <div key={file.id} className={`file-item ${file.status}`}>
                <div className="file-info">
                  <div className="file-icon">
                    {getStatusIcon(file.status)}
                  </div>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-status">{getStatusText(file.status)}</span>
                  </div>
                </div>
                <button 
                  className="remove-file-button"
                  onClick={() => removeFile(file.id)}
                  disabled={file.status === 'processing'}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="upload-tips">
        <h4>💡 Dicas:</h4>
        <ul>
          <li>Arquivos CSV devem ter cabeçalhos na primeira linha</li>
          <li>Arquivos XLSX devem ter dados na primeira planilha</li>
          <li>Tamanho máximo recomendado: 50MB por arquivo</li>
          <li>Você pode fazer upload de múltiplos arquivos simultaneamente</li>
        </ul>
      </div>
    </div>
  )
}

export default FileUploadDragDrop
