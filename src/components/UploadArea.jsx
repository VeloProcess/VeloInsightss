import React, { useRef, useState } from 'react'
import './UploadArea.css'

const UploadArea = ({ onFileUpload, disabled }) => {
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file) => {
    if (!file) return
    
    // Validar tipo de arquivo
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    const allowedExtensions = ['.csv', '.xls', '.xlsx']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Por favor, selecione um arquivo CSV ou Excel (.csv, .xls, .xlsx)')
      return
    }
    
    // Validar tamanho (40MB limite)
    const maxSize = 40 * 1024 * 1024 // 40MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo permitido: 40MB')
      return
    }
    
    onFileUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
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
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
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
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />
          
          <div className="upload-content">
            <div className="upload-icon">
              {disabled ? '⏳' : isDragOver ? '📂' : '📁'}
            </div>
            
            <h3 className="upload-title">
              {disabled ? 'Processando...' : isDragOver ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para selecionar'}
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
