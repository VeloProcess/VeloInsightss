// Velodados - Interface e Gráficos
// Gerenciamento da UI e renderização de gráficos

let currentData = null;
let currentMetrics = null;
let currentOperatorMetrics = null;
let currentScores = null;
let largeFileParser = null;

// Inicialização da interface
document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('🚀 Velodados iniciando...');
    initializeUI();
    setupEventListeners();
    console.log('✅ Velodados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro crítico na inicialização:', error);
    alert('Erro crítico na inicialização do sistema. Recarregue a página.');
  }
});

// Capturar erros globais não tratados
window.addEventListener('error', function(event) {
  console.error('❌ Erro global capturado:', event.error);
  console.error('❌ Stack trace:', event.error?.stack);
});

// Capturar promessas rejeitadas não tratadas
window.addEventListener('unhandledrejection', function(event) {
  console.error('❌ Promise rejeitada não tratada:', event.reason);
  event.preventDefault(); // Previne o crash
});

/**
 * Processa arquivo via backend para arquivos grandes
 * @param {File} file - Arquivo para processar
 */
async function processFileViaBackend(file) {
  try {
    console.log('📡 Iniciando processamento via backend...');
    
    // Mostrar progresso
    showProgress(0, 'Enviando arquivo para o servidor...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro no servidor');
    }
    
    showProgress(50, 'Processando dados...');
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Erro no processamento');
    }
    
    showProgress(100, 'Processamento concluído!');
    
    console.log('✅ Dados recebidos do backend:', result.validRows, 'linhas válidas');
    
    // Processar dados recebidos
    await processBackendData(result.data, result.isVelotaxData);
    
    hideProgress();
    
  } catch (error) {
    console.error('❌ Erro no backend:', error);
    hideProgress();
    
    let errorMessage = 'Erro no processamento via servidor: ';
    if (error.message.includes('fetch')) {
      errorMessage += 'Servidor não está rodando. Execute "npm run api" para iniciar o backend.';
    } else {
      errorMessage += error.message;
    }
    
    showErrorMessage(errorMessage);
  }
}

/**
 * Processa dados recebidos do backend
 * @param {Array} data - Dados processados
 * @param {boolean} isVelotaxData - Se são dados da Velotax
 */
async function processBackendData(data, isVelotaxData) {
  try {
    console.log('🔄 Processando dados do backend...');
    
    if (isVelotaxData) {
      // Calcular métricas específicas da Velotax
      const velotaxMetrics = calculateVelotaxMetrics(data);
      updateMetricsCards(velotaxMetrics);
      
      // Calcular métricas por operador
      const operatorMetrics = calculateOperatorMetrics(data);
      updateOperatorMetrics(operatorMetrics);
      
      // Calcular scores e ranking
      const scores = calculateScores(operatorMetrics);
      updateRanking(scores);
      
      // Atualizar gráficos
      updateCharts(data);
      
    } else {
      // Processar dados padrão
      await processStandardData(data);
    }
    
    console.log('✅ Dados do backend processados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao processar dados do backend:', error);
    showErrorMessage('Erro ao processar dados recebidos do servidor: ' + error.message);
  }
}

/**
 * Inicializa a interface do usuário
 */
function initializeUI() {
  // Configurar navegação da sidebar
  setupSidebarNavigation();
  
  // Configurar área de upload
  setupUploadArea();
  
  // Inicializar gráficos vazios
  initializeCharts();
  
  // Inicializar parser de arquivos grandes
  initializeLargeFileParser();
}

/**
 * Configura os event listeners
 */
function setupEventListeners() {
  // Upload de arquivo
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }
  
  // Drag and drop
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
  }
}

/**
 * Configura navegação da sidebar
 */
function setupSidebarNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remover classe active de todos os links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Adicionar classe active ao link clicado
      this.classList.add('active');
      
      // Mostrar seção correspondente
      const sectionId = this.getAttribute('data-section');
      showSection(sectionId);
    });
  });
}

/**
 * Mostra uma seção específica
 * @param {string} sectionId - ID da seção
 */
function showSection(sectionId) {
  // Esconder todas as seções
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Mostrar seção selecionada
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

/**
 * Configura área de upload
 */
function setupUploadArea() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  
  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });
  }
}

/**
 * Inicializa gráficos vazios
 */
function initializeCharts() {
  // Gráfico de atendimentos por dia
  const callsPerDayCtx = document.getElementById('callsPerDayChart');
  if (callsPerDayCtx) {
    new Chart(callsPerDayCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Atendimentos',
          data: [],
          borderColor: 'var(--color-blue-primary)',
          backgroundColor: 'var(--color-blue-light)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Gráfico de distribuição de avaliações
  const ratingsCtx = document.getElementById('ratingsDistributionChart');
  if (ratingsCtx) {
    new Chart(ratingsCtx, {
      type: 'bar',
      data: {
        labels: ['1', '2', '3', '4', '5'],
        datasets: [{
          label: 'Avaliação do Atendimento',
          data: [0, 0, 0, 0, 0],
          backgroundColor: 'var(--color-blue-primary)',
          borderColor: 'var(--color-blue-dark)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

/**
 * Manipula upload de arquivo
 * @param {Event} event - Evento de mudança do input
 */
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    await processFile(file);
  }
}

/**
 * Manipula drag over
 * @param {Event} event - Evento de drag over
 */
function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('dragover');
}

/**
 * Manipula drag leave
 * @param {Event} event - Evento de drag leave
 */
function handleDragLeave(event) {
  event.currentTarget.classList.remove('dragover');
}

/**
 * Manipula drop de arquivo
 * @param {Event} event - Evento de drop
 */
async function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragover');
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    await processFile(files[0]);
  }
}

/**
 * Inicializa o parser de arquivos grandes
 */
function initializeLargeFileParser() {
  if (typeof LargeFileParser !== 'undefined') {
    largeFileParser = new LargeFileParser();
  }
}

/**
 * Processa arquivo enviado
 * @param {File} file - Arquivo para processar
 */
async function processFile(file) {
  try {
    console.log('🚀 Iniciando processamento do arquivo...');
    
    // Verificar se é um arquivo grande
    const fileSize = file.size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    
    console.log(`📁 Processando arquivo: ${file.name} (${fileSizeMB}MB)`);
    
    // Verificar limite de memória
    if (fileSize > 50 * 1024 * 1024) { // 50MB
      console.log('📡 Arquivo grande detectado, usando backend...');
      await processFileViaBackend(file);
      return;
    }
    
    // Se arquivo for muito grande ou for Excel, usar parser otimizado
    const fileType = file.name.toLowerCase();
    const isExcel = fileType.endsWith('.xlsx') || fileType.endsWith('.xls');
    
    console.log(`🔍 Tipo de arquivo: ${fileType}, É Excel: ${isExcel}, Tamanho: ${fileSizeMB}MB`);
    
    // Adicionar timeout mais generoso
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Processamento demorou mais de 60 segundos')), 60000);
    });
    
    const processPromise = isExcel || fileSize > 5 * 1024 * 1024 || largeFileParser 
      ? processLargeFile(file)
      : processSmallFile(file);
    
    await Promise.race([processPromise, timeoutPromise]);
    
  } catch (error) {
    console.error('❌ Erro ao processar arquivo:', error);
    hideLoading();
    hideProgressIndicator();
    
    // Mostrar erro mais detalhado
    let errorMessage = `Erro ao processar arquivo: ${error.message}`;
    
    if (error.message.includes('Timeout')) {
      errorMessage += '\n\n💡 Solução: Use arquivos menores ou aguarde mais tempo.';
    } else if (error.message.includes('memória') || error.message.includes('memory')) {
      errorMessage += '\n\n💡 Solução: Arquivo muito grande. Tente um arquivo menor.';
    } else if (error.message.includes('muito grande')) {
      errorMessage += '\n\n💡 Solução: Tente um arquivo menor que 200MB.';
    }
    
    showErrorMessage(errorMessage);
  }
}

/**
 * Processa arquivo pequeno (método original)
 * @param {File} file - Arquivo para processar
 */
async function processSmallFile(file) {
  // Mostrar loading
  showLoading();
  
  // Parsear arquivo
  const result = await parseFile(file);
  
  if (result.errors.length > 0) {
    console.warn('Erros encontrados:', result.errors);
  }
  
  if (result.rows.length === 0) {
    throw new Error('Nenhum dado válido encontrado no arquivo');
  }
  
  // Verificar se são dados da Velotax (verificar dados brutos antes do processamento)
  const isVelotaxData = detectVelotaxDataFromRaw(result.rows);
  
  if (isVelotaxData) {
    console.log('🎯 Dados da Velotax detectados! Usando parser específico...');
    await processVelotaxData(result.rows);
  } else {
    // Processar dados padrão
    await processStandardData(result.rows);
  }
  
  // Esconder loading
  hideLoading();
}

/**
 * Detecta se os dados são da Velotax (dados brutos)
 * @param {Array} rows - Dados brutos
 * @returns {boolean} - Se são dados da Velotax
 */
function detectVelotaxDataFromRaw(rows) {
  if (!rows || rows.length === 0) return false;
  
  const firstRow = rows[0];
  
  // Verificar campos específicos da Velotax nos dados brutos
  const velotaxFields = ['Operador', 'Chamada', 'Id Ligação', 'Fila', 'Cpf/Cnpj', 'Tempo Na Ura'];
  const hasVelotaxFields = velotaxFields.some(field => field in firstRow);
  
  // Verificar se tem operadores típicos da Velotax
  const hasVelotaxOperators = rows.some(row => 
    row.Operador === 'Agentes indisponíveis' || 
    row.Operador === 'Sistema' ||
    row.Operador === ''
  );
  
  // Verificar se tem status típicos da Velotax
  const hasVelotaxStatus = rows.some(row => 
    row.Chamada === 'Abandonada' || 
    row.Chamada === 'Retida na URA'
  );
  
  return hasVelotaxFields || hasVelotaxOperators || hasVelotaxStatus;
}

/**
 * Detecta se os dados são da Velotax (dados processados)
 * @param {Array} rows - Dados processados
 * @returns {boolean} - Se são dados da Velotax
 */
function detectVelotaxData(rows) {
  if (!rows || rows.length === 0) return false;
  
  const firstRow = rows[0];
  
  // Verificar campos específicos da Velotax
  const velotaxFields = ['call_status', 'call_id', 'queue', 'cpf_cnpj', 'ura_time'];
  const hasVelotaxFields = velotaxFields.some(field => field in firstRow);
  
  // Verificar se tem operadores típicos da Velotax
  const hasVelotaxOperators = rows.some(row => 
    row.operator === 'Agentes indisponíveis' || 
    row.operator === 'Sistema'
  );
  
  return hasVelotaxFields || hasVelotaxOperators;
}

/**
 * Processa dados da Velotax
 * @param {Array} rawRows - Dados brutos
 */
async function processVelotaxData(rawRows) {
  console.log('🎯 Processando dados da Velotax...');
  console.log('📊 Dados brutos recebidos:', rawRows.length, 'registros');
  
  // Usar parser específico da Velotax
  const result = parseVelotaxData(rawRows);
  
  console.log('✅ Parser da Velotax concluído:', result.rows.length, 'válidos,', result.errors.length, 'erros');
  
  if (result.errors.length > 0) {
    console.warn('⚠️ Erros encontrados nos dados da Velotax:', result.errors.slice(0, 5)); // Mostrar apenas os primeiros 5 erros
  }
  
  if (result.rows.length === 0) {
    throw new Error('Nenhum dado válido encontrado nos dados da Velotax');
  }
  
  // Armazenar dados
  currentData = result.rows;
  console.log('💾 Dados armazenados:', currentData.length, 'registros');
  
  // Calcular métricas padrão
  console.log('📈 Calculando métricas padrão...');
  currentMetrics = calcMetrics(currentData);
  currentOperatorMetrics = operatorMetrics(currentData);
  currentScores = computeScores(currentOperatorMetrics);
  
  // Calcular métricas específicas da Velotax
  console.log('🎯 Calculando métricas específicas da Velotax...');
  const velotaxMetrics = calculateVelotaxMetrics(currentData);
  
  console.log('📊 Métricas da Velotax:', velotaxMetrics);
  
  // Atualizar interface
  console.log('🖥️ Atualizando interface...');
  updateMetricsCards(velotaxMetrics);
  updateCharts();
  updateOperatorSection();
  updateRankingSection();
  updateReportsSection();
  
  // Mostrar mensagem de sucesso
  showSuccessMessage(`Dados da Velotax processados! ${result.rows.length} registros carregados.`);
  console.log('✅ Processamento da Velotax concluído com sucesso!');
}

/**
 * Processa dados padrão
 * @param {Array} rows - Dados processados
 */
async function processStandardData(rows) {
  // Armazenar dados
  currentData = rows;
  
  // Calcular métricas
  currentMetrics = calcMetrics(currentData);
  currentOperatorMetrics = operatorMetrics(currentData);
  currentScores = computeScores(currentOperatorMetrics);
  
  // Atualizar interface
  updateMetricsCards();
  updateCharts();
  updateOperatorSection();
  updateRankingSection();
  updateReportsSection();
  
  // Mostrar mensagem de sucesso
  showSuccessMessage(`Arquivo processado com sucesso! ${rows.length} registros carregados.`);
}

/**
 * Processa arquivo grande com indicador de progresso
 * @param {File} file - Arquivo para processar
 */
async function processLargeFile(file) {
  if (!largeFileParser) {
    throw new Error('Parser de arquivos grandes não disponível');
  }
  
  // Mostrar indicador de progresso
  showProgressIndicator();
  
  // Marcar início do processamento
  window.processingStartTime = Date.now();
  
  // Configurar callbacks
  const callbacks = {
    onProgress: (data) => {
      updateProgress(data);
    },
    onChunk: (data) => {
      // Processar chunk de dados
      if (!currentData) {
        currentData = [];
      }
      currentData.push(...data.rows);
      
      // Atualizar métricas parciais
      if (currentData.length > 0) {
        currentMetrics = calcMetrics(currentData);
        updateMetricsCards();
      }
    },
    onComplete: (data) => {
      // Processamento concluído
      currentData = data.rows;
      currentMetrics = calcMetrics(currentData);
      currentOperatorMetrics = operatorMetrics(currentData);
      currentScores = computeScores(currentOperatorMetrics);
      
      // Atualizar interface completa
      updateMetricsCards();
      updateCharts();
      updateOperatorSection();
      updateRankingSection();
      updateReportsSection();
      
      // Esconder progresso
      hideProgressIndicator();
      
      // Mostrar mensagem de sucesso
      const message = data.processedOnServer 
        ? `Arquivo processado no servidor! ${data.validRows} registros carregados.`
        : `Arquivo processado com sucesso! ${data.validRows} registros carregados.`;
      showSuccessMessage(message);
    },
    onError: (data) => {
      console.error('Erro no processamento:', data);
      hideProgressIndicator();
      showErrorMessage(`Erro ao processar arquivo: ${data.message}`);
    }
  };
  
  // Verificar se é Excel e processar no thread principal
  const fileType = file.name.toLowerCase();
  const isExcel = fileType.endsWith('.xlsx') || fileType.endsWith('.xls');
  
  if (isExcel) {
    console.log('🔍 Processando Excel no thread principal...');
    // Processar Excel no thread principal
    largeFileParser.progressCallback = callbacks.onProgress;
    largeFileParser.chunkCallback = callbacks.onChunk;
    largeFileParser.completeCallback = callbacks.onComplete;
    largeFileParser.errorCallback = callbacks.onError;
    largeFileParser.isCancelled = false;
    
    try {
      await largeFileParser.processExcelInMainThread(file);
    } catch (error) {
      console.error('❌ Erro no processamento Excel:', error);
      throw error;
    }
  } else {
    console.log('🔍 Processando CSV no Web Worker...');
    // Processar CSV no Web Worker
    try {
      await largeFileParser.processFile(file, callbacks);
    } catch (error) {
      console.error('❌ Erro no processamento CSV:', error);
      throw error;
    }
  }
}

/**
 * Atualiza cards de métricas
 * @param {Object} velotaxMetrics - Métricas específicas da Velotax (opcional)
 */
function updateMetricsCards(velotaxMetrics = null) {
  if (!currentMetrics) return;
  
  const elements = {
    totalCalls: document.getElementById('totalCalls'),
    avgDuration: document.getElementById('avgDuration'),
    avgRatingAttendance: document.getElementById('avgRatingAttendance'),
    avgRatingSolution: document.getElementById('avgRatingSolution'),
    activeOperators: document.getElementById('activeOperators'),
    avgPause: document.getElementById('avgPause')
  };
  
  if (elements.totalCalls) elements.totalCalls.textContent = currentMetrics.totalCalls;
  if (elements.avgDuration) elements.avgDuration.textContent = currentMetrics.avgDuration + ' min';
  if (elements.avgRatingAttendance) elements.avgRatingAttendance.textContent = currentMetrics.avgRatingAttendance;
  if (elements.avgRatingSolution) elements.avgRatingSolution.textContent = currentMetrics.avgRatingSolution;
  if (elements.activeOperators) elements.activeOperators.textContent = currentMetrics.activeOperators;
  if (elements.avgPause) elements.avgPause.textContent = currentMetrics.avgPause + ' min';
  
  // Se são dados da Velotax, atualizar cards com métricas específicas
  if (velotaxMetrics) {
    updateVelotaxCards(velotaxMetrics);
  }
}

/**
 * Atualiza cards específicos da Velotax
 * @param {Object} velotaxMetrics - Métricas da Velotax
 */
function updateVelotaxCards(velotaxMetrics) {
  // Atualizar títulos dos cards para refletir dados da Velotax
  const cardTitles = {
    totalCalls: 'Total de Chamadas',
    avgDuration: 'Duração Média',
    avgRatingAttendance: 'Taxa de Atendimento',
    avgRatingSolution: 'Taxa de Resolução',
    activeOperators: 'Operadores Únicos',
    avgPause: 'Tempo de URA'
  };
  
  // Atualizar títulos
  Object.keys(cardTitles).forEach(key => {
    const card = document.querySelector(`#${key}`).closest('.card');
    if (card) {
      const title = card.querySelector('.card-title');
      if (title) {
        title.textContent = cardTitles[key];
      }
    }
  });
  
  // Atualizar valores específicos da Velotax
  const totalCallsEl = document.getElementById('totalCalls');
  const avgDurationEl = document.getElementById('avgDuration');
  const avgRatingAttendanceEl = document.getElementById('avgRatingAttendance');
  const avgRatingSolutionEl = document.getElementById('avgRatingSolution');
  const activeOperatorsEl = document.getElementById('activeOperators');
  const avgPauseEl = document.getElementById('avgPause');
  
  if (totalCallsEl) {
    totalCallsEl.textContent = velotaxMetrics.totalCalls.toLocaleString();
  }
  
  if (avgDurationEl) {
    avgDurationEl.textContent = velotaxMetrics.avgCallDuration + ' min';
  }
  
  if (avgRatingAttendanceEl) {
    const attendanceRate = ((velotaxMetrics.answeredCalls / velotaxMetrics.totalCalls) * 100).toFixed(1);
    avgRatingAttendanceEl.textContent = attendanceRate + '%';
  }
  
  if (avgRatingSolutionEl) {
    const solutionRate = ((velotaxMetrics.answeredCalls / velotaxMetrics.totalCalls) * 100).toFixed(1);
    avgRatingSolutionEl.textContent = solutionRate + '%';
  }
  
  if (activeOperatorsEl) {
    activeOperatorsEl.textContent = velotaxMetrics.uniqueOperators;
  }
  
  if (avgPauseEl) {
    avgPauseEl.textContent = velotaxMetrics.avgUraTime + ' min';
  }
  
  // Adicionar cards específicos da Velotax se não existirem
  addVelotaxSpecificCards(velotaxMetrics);
}

/**
 * Adiciona cards específicos da Velotax
 * @param {Object} velotaxMetrics - Métricas da Velotax
 */
function addVelotaxSpecificCards(velotaxMetrics) {
  const cardsGrid = document.getElementById('metricsCards');
  if (!cardsGrid) return;
  
  // Verificar se já existem cards da Velotax
  if (document.getElementById('abandonedCalls')) return;
  
  // Criar cards específicos da Velotax
  const velotaxCards = `
    <div class="card">
      <div class="card-header">
        <div class="card-icon">📞</div>
        <h3 class="card-title">Chamadas Atendidas</h3>
      </div>
      <div class="card-value" id="answeredCalls">${velotaxMetrics.answeredCalls.toLocaleString()}</div>
      <p class="card-subtitle">Chamadas efetivamente atendidas</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <div class="card-icon">❌</div>
        <h3 class="card-title">Chamadas Abandonadas</h3>
      </div>
      <div class="card-value" id="abandonedCalls">${velotaxMetrics.abandonedCalls.toLocaleString()}</div>
      <p class="card-subtitle">Chamadas abandonadas</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <div class="card-icon">🤖</div>
        <h3 class="card-title">Chamadas URA</h3>
      </div>
      <div class="card-value" id="uraCalls">${velotaxMetrics.uraCalls.toLocaleString()}</div>
      <p class="card-subtitle">Chamadas retidas na URA</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <div class="card-icon">⏱️</div>
        <h3 class="card-title">Tempo de Fala</h3>
      </div>
      <div class="card-value" id="avgTalkTime">${velotaxMetrics.avgTalkTime} min</div>
      <p class="card-subtitle">Tempo médio de fala</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <div class="card-icon">⏳</div>
        <h3 class="card-title">Tempo de Espera</h3>
      </div>
      <div class="card-value" id="avgWaitTime">${velotaxMetrics.avgWaitTime} min</div>
      <p class="card-subtitle">Tempo médio de espera</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <div class="card-icon">🔄</div>
        <h3 class="card-title">Taxa de Transbordo</h3>
      </div>
      <div class="card-value" id="overflowRate">${velotaxMetrics.overflowRate}%</div>
      <p class="card-subtitle">Taxa de transbordo</p>
    </div>
  `;
  
  // Adicionar cards ao grid
  cardsGrid.insertAdjacentHTML('beforeend', velotaxCards);
}

/**
 * Atualiza gráficos
 */
function updateCharts() {
  if (!currentData) return;
  
  // Atualizar gráfico de atendimentos por dia
  updateCallsPerDayChart();
  
  // Atualizar gráfico de distribuição de avaliações
  updateRatingsDistributionChart();
}

/**
 * Atualiza gráfico de atendimentos por dia
 */
function updateCallsPerDayChart() {
  const ctx = document.getElementById('callsPerDayChart');
  if (!ctx) return;
  
  const dailyData = dailyStats(currentData);
  const labels = dailyData.map(day => {
    const date = new Date(day.date);
    return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
  });
  const data = dailyData.map(day => day.calls);
  
  const chart = Chart.getChart(ctx);
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

/**
 * Atualiza gráfico de distribuição de avaliações
 */
function updateRatingsDistributionChart() {
  const ctx = document.getElementById('ratingsDistributionChart');
  if (!ctx) return;
  
  const distribution = ratingDistribution(currentData);
  const data = [1, 2, 3, 4, 5].map(rating => distribution.attendance[rating] || 0);
  
  const chart = Chart.getChart(ctx);
  if (chart) {
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

/**
 * Atualiza seção de operadores
 */
function updateOperatorSection() {
  const section = document.getElementById('operators');
  if (!section || !currentOperatorMetrics) return;
  
  const operatorsList = Object.keys(currentOperatorMetrics).map(operator => {
    const metrics = currentOperatorMetrics[operator];
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-icon">👤</div>
          <h3 class="card-title">${operator}</h3>
        </div>
        <div class="card-value">${metrics.totalCalls} atendimentos</div>
        <p class="card-subtitle">Duração média: ${metrics.avgDuration} min</p>
        <p class="card-subtitle">Avaliação: ${metrics.avgRatingAttendance}/5</p>
        <p class="card-subtitle">Solução: ${metrics.avgRatingSolution}/5</p>
      </div>
    `;
  }).join('');
  
  section.innerHTML = `
    <h2>Análise Individual por Operador</h2>
    <div class="cards-grid">
      ${operatorsList}
    </div>
  `;
}

/**
 * Atualiza seção de ranking
 */
function updateRankingSection() {
  const section = document.getElementById('ranking');
  if (!section || !currentScores) return;
  
  const rankingList = currentScores.map((item, index) => {
    const position = index + 1;
    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅';
    
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-icon">${medal}</div>
          <h3 class="card-title">#${position} - ${item.operator}</h3>
        </div>
        <div class="card-value">${item.score}</div>
        <p class="card-subtitle">Score de Performance</p>
        <p class="card-subtitle">${item.metrics.totalCalls} atendimentos</p>
      </div>
    `;
  }).join('');
  
  section.innerHTML = `
    <h2>Ranking de Operadores</h2>
    <div class="cards-grid">
      ${rankingList}
    </div>
  `;
}

/**
 * Atualiza seção de relatórios
 */
function updateReportsSection() {
  const section = document.getElementById('reports');
  if (!section) return;
  
  section.innerHTML = `
    <h2>Relatórios e Exportações</h2>
    <div class="cards-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-icon">📊</div>
          <h3 class="card-title">Exportar Excel</h3>
        </div>
        <p class="card-subtitle">Dados completos em planilha</p>
        <button class="btn" onclick="exportToExcel()">Exportar</button>
      </div>
      
      <div class="card">
        <div class="card-header">
          <div class="card-icon">📄</div>
          <h3 class="card-title">Exportar PDF</h3>
        </div>
        <p class="card-subtitle">Relatório completo em PDF</p>
        <button class="btn btn-secondary" onclick="exportToPDF()">Exportar</button>
      </div>
    </div>
  `;
}

/**
 * Mostra loading
 */
function showLoading() {
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.innerHTML = `
      <div class="upload-content">
        <h3>⏳ Processando arquivo...</h3>
        <p>Por favor, aguarde enquanto processamos os dados.</p>
      </div>
    `;
  }
}

/**
 * Mostra indicador de progresso
 */
function showProgressIndicator() {
  const uploadArea = document.getElementById('uploadArea');
  const progressContainer = document.getElementById('progressContainer');
  
  if (uploadArea) {
    uploadArea.classList.add('processing');
    uploadArea.querySelector('.upload-content').style.display = 'none';
  }
  
  if (progressContainer) {
    progressContainer.style.display = 'block';
    updateProgress({ percentage: 0, processed: 0, total: 0, valid: 0, errors: 0 });
  }
  
  // Configurar botão de cancelar
  const cancelBtn = document.getElementById('cancelProcessing');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      if (largeFileParser) {
        largeFileParser.cancel();
      }
      hideProgressIndicator();
    };
  }
}

/**
 * Atualiza indicador de progresso
 * @param {Object} data - Dados de progresso
 */
function updateProgress(data) {
  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');
  const progressDetails = document.getElementById('progressDetails');
  
  if (progressText) {
    progressText.textContent = `${data.percentage}%`;
  }
  
  if (progressFill) {
    progressFill.style.width = `${data.percentage}%`;
  }
  
  if (progressDetails) {
    progressDetails.innerHTML = `
      <p>Processadas: ${data.processed.toLocaleString()} de ${data.total.toLocaleString()} linhas</p>
      <p>Válidas: ${data.valid.toLocaleString()} | Erros: ${data.errors.toLocaleString()}</p>
      <p>Velocidade: ${Math.round(data.processed / Math.max(1, (Date.now() - window.processingStartTime) / 1000))} linhas/seg</p>
    `;
  }
}

/**
 * Esconde indicador de progresso
 */
function hideProgressIndicator() {
  const uploadArea = document.getElementById('uploadArea');
  const progressContainer = document.getElementById('progressContainer');
  
  if (uploadArea) {
    uploadArea.classList.remove('processing');
    uploadArea.querySelector('.upload-content').style.display = 'block';
  }
  
  if (progressContainer) {
    progressContainer.style.display = 'none';
  }
}

/**
 * Esconde loading
 */
function hideLoading() {
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.innerHTML = `
      <div class="upload-content">
        <h3>📁 Faça upload do arquivo de dados</h3>
        <p>Arraste e solte um arquivo CSV ou Excel aqui, ou clique para selecionar</p>
        <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" style="display: none;">
        <button class="btn" onclick="document.getElementById('fileInput').click()">
          Selecionar Arquivo
        </button>
      </div>
    `;
    
    // Reconfigurar event listeners
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', handleFileUpload);
    }
  }
}

/**
 * Mostra mensagem de sucesso
 * @param {string} message - Mensagem
 */
function showSuccessMessage(message) {
  // Implementar sistema de notificações
  console.log('✅', message);
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem
 */
function showErrorMessage(message) {
  // Implementar sistema de notificações
  console.error('❌', message);
  alert(message); // Fallback simples
}


// Exportar funções para uso global
window.exportToExcel = function() {
  if (typeof exportExcel === 'function') {
    exportExcel(currentData);
  } else {
    alert('Função de exportação Excel não disponível');
  }
};

window.exportToPDF = function() {
  if (typeof exportPDF === 'function') {
    exportPDF();
  } else {
    alert('Função de exportação PDF não disponível');
  }
};
