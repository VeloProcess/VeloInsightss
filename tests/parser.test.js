// Velodados - Testes do Parser
// Testes unitários para o módulo parser.js

// Mock do ambiente de teste (se não estiver usando Jest)
if (typeof describe === 'undefined') {
  global.describe = (name, fn) => {
    console.log(`\n🧪 ${name}`);
    fn();
  };
  global.it = (name, fn) => {
    try {
      fn();
      console.log(`  ✅ ${name}`);
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message}`);
    }
  };
  global.expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`Expected null, but got ${actual}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected truthy value, but got ${actual}`);
      }
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, but got ${actual.length}`);
      }
    }
  });
}

// Mock do FileReader para testes
class MockFileReader {
  constructor() {
    this.result = null;
    this.error = null;
    this.onload = null;
    this.onerror = null;
  }
  
  readAsText(file, encoding) {
    setTimeout(() => {
      if (this.result) {
        this.onload && this.onload({ target: { result: this.result } });
      } else {
        this.onerror && this.onerror();
      }
    }, 0);
  }
  
  readAsArrayBuffer(file) {
    setTimeout(() => {
      if (this.result) {
        this.onload && this.onload({ target: { result: this.result } });
      } else {
        this.onerror && this.onerror();
      }
    }, 0);
  }
}

// Mock do XLSX para testes
const mockXLSX = {
  read: (data, options) => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {}
    }
  }),
  utils: {
    sheet_to_json: (sheet) => [
      {
        date: '2024-01-15',
        operator: 'Ana Silva',
        duration_minutes: 8.5,
        rating_attendance: 5,
        rating_solution: 4,
        pause_minutes: 10
      }
    ]
  }
};

// Configurar mocks globais
global.FileReader = MockFileReader;
global.XLSX = mockXLSX;

// Carregar o módulo parser (simular import)
const fs = require('fs');
const parserCode = fs.readFileSync('../public/js/parser.js', 'utf8');
eval(parserCode);

describe('Parser de Arquivos', () => {
  describe('getFileType', () => {
    it('deve identificar arquivo CSV corretamente', () => {
      const csvFile = { name: 'dados.csv' };
      expect(getFileType(csvFile)).toBe('csv');
    });
    
    it('deve identificar arquivo Excel corretamente', () => {
      const excelFile = { name: 'dados.xlsx' };
      expect(getFileType(excelFile)).toBe('excel');
    });
    
    it('deve retornar null para arquivo não suportado', () => {
      const txtFile = { name: 'dados.txt' };
      expect(getFileType(txtFile)).toBeNull();
    });
  });
  
  describe('parseCSV', () => {
    it('deve processar CSV válido corretamente', () => {
      const csvContent = `date,operator,duration_minutes,rating_attendance,rating_solution,pause_minutes
2024-01-15,Ana Silva,8.5,5,4,10
2024-01-16,João Santos,12.3,4,5,15`;
      
      const result = parseCSV(csvContent);
      
      expect(result.rows).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.rows[0].operator).toBe('Ana Silva');
      expect(result.rows[0].duration_minutes).toBe(8.5);
    });
    
    it('deve detectar cabeçalhos ausentes', () => {
      const csvContent = `date,operator,duration_minutes
2024-01-15,Ana Silva,8.5`;
      
      const result = parseCSV(csvContent);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain('Cabeçalhos obrigatórios ausentes');
    });
    
    it('deve detectar linhas inválidas', () => {
      const csvContent = `date,operator,duration_minutes,rating_attendance,rating_solution,pause_minutes
2024-01-15,Ana Silva,8.5,5,4,10
2024-01-16,,12.3,4,5,15`;
      
      const result = parseCSV(csvContent);
      
      expect(result.rows).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
    });
  });
  
  describe('validateAndNormalizeRow', () => {
    it('deve normalizar dados válidos', () => {
      const row = {
        date: '2024-01-15',
        operator: 'Ana Silva',
        duration_minutes: '8.5',
        rating_attendance: '5',
        rating_solution: '4',
        pause_minutes: '10'
      };
      
      const result = validateAndNormalizeRow(row);
      
      expect(result).toBeTruthy();
      expect(result.operator).toBe('Ana Silva');
      expect(result.duration_minutes).toBe(8.5);
      expect(result.rating_attendance).toBe(5);
    });
    
    it('deve rejeitar dados com campos ausentes', () => {
      const row = {
        date: '2024-01-15',
        operator: 'Ana Silva',
        duration_minutes: '8.5'
        // Campos obrigatórios ausentes
      };
      
      const result = validateAndNormalizeRow(row);
      expect(result).toBeNull();
    });
    
    it('deve rejeitar avaliações fora do range 1-5', () => {
      const row = {
        date: '2024-01-15',
        operator: 'Ana Silva',
        duration_minutes: '8.5',
        rating_attendance: '6', // Inválido
        rating_solution: '4',
        pause_minutes: '10'
      };
      
      const result = validateAndNormalizeRow(row);
      expect(result).toBeNull();
    });
  });
  
  describe('parseFile', () => {
    it('deve processar arquivo CSV com sucesso', async () => {
      const csvContent = `date,operator,duration_minutes,rating_attendance,rating_solution,pause_minutes
2024-01-15,Ana Silva,8.5,5,4,10`;
      
      // Mock do FileReader
      const originalFileReader = global.FileReader;
      global.FileReader = class extends MockFileReader {
        readAsText() {
          this.result = csvContent;
          super.readAsText();
        }
      };
      
      const file = { name: 'test.csv', type: 'text/csv' };
      const result = await parseFile(file);
      
      expect(result.rows).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      
      // Restaurar FileReader original
      global.FileReader = originalFileReader;
    });
    
    it('deve retornar erro para arquivo não suportado', async () => {
      const file = { name: 'test.txt', type: 'text/plain' };
      const result = await parseFile(file);
      
      expect(result.rows).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Tipo de arquivo não suportado');
    });
  });
});

// Executar testes se chamado diretamente
if (require.main === module) {
  console.log('🧪 Executando testes do Parser...\n');
  
  // Executar todos os testes
  describe('Parser de Arquivos', () => {
    // Os testes já estão definidos acima
  });
  
  console.log('\n✅ Testes do Parser concluídos!');
}
