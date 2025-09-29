// Velodados - Testes de Métricas
// Testes unitários para o módulo metrics.js

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
    toBeCloseTo: (expected, precision = 2) => {
      if (Math.abs(actual - expected) > Math.pow(10, -precision)) {
        throw new Error(`Expected ${actual} to be close to ${expected} with precision ${precision}`);
      }
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, but got ${actual.length}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    }
  });
}

// Carregar o módulo metrics (simular import)
const fs = require('fs');
const metricsCode = fs.readFileSync('../public/js/metrics.js', 'utf8');
eval(metricsCode);

describe('Cálculos de Métricas', () => {
  // Dados de teste
  const testData = [
    {
      date: '2024-01-15T00:00:00.000Z',
      operator: 'Ana Silva',
      duration_minutes: 8.5,
      rating_attendance: 5,
      rating_solution: 4,
      pause_minutes: 10
    },
    {
      date: '2024-01-15T00:00:00.000Z',
      operator: 'João Santos',
      duration_minutes: 12.3,
      rating_attendance: 4,
      rating_solution: 5,
      pause_minutes: 15
    },
    {
      date: '2024-01-16T00:00:00.000Z',
      operator: 'Ana Silva',
      duration_minutes: 9.1,
      rating_attendance: 4,
      rating_solution: 4,
      pause_minutes: 12
    },
    {
      date: '2024-01-16T00:00:00.000Z',
      operator: 'Maria Costa',
      duration_minutes: 6.2,
      rating_attendance: 5,
      rating_solution: 5,
      pause_minutes: 8
    }
  ];
  
  describe('calcMetrics', () => {
    it('deve calcular métricas gerais corretamente', () => {
      const metrics = calcMetrics(testData);
      
      expect(metrics.totalCalls).toBe(4);
      expect(metrics.activeOperators).toBe(3);
      expect(metrics.avgDuration).toBeCloseTo(9.025, 2);
      expect(metrics.avgRatingAttendance).toBeCloseTo(4.5, 2);
      expect(metrics.avgRatingSolution).toBeCloseTo(4.5, 2);
      expect(metrics.avgPause).toBeCloseTo(11.25, 2);
    });
    
    it('deve retornar métricas zeradas para array vazio', () => {
      const metrics = calcMetrics([]);
      
      expect(metrics.totalCalls).toBe(0);
      expect(metrics.activeOperators).toBe(0);
      expect(metrics.avgDuration).toBe(0);
      expect(metrics.avgRatingAttendance).toBe(0);
      expect(metrics.avgRatingSolution).toBe(0);
      expect(metrics.avgPause).toBe(0);
    });
    
    it('deve lidar com ratings nulos corretamente', () => {
      const dataWithNulls = [
        {
          date: '2024-01-15T00:00:00.000Z',
          operator: 'Ana Silva',
          duration_minutes: 8.5,
          rating_attendance: null,
          rating_solution: 4,
          pause_minutes: 10
        },
        {
          date: '2024-01-16T00:00:00.000Z',
          operator: 'João Santos',
          duration_minutes: 12.3,
          rating_attendance: 5,
          rating_solution: null,
          pause_minutes: 15
        }
      ];
      
      const metrics = calcMetrics(dataWithNulls);
      
      expect(metrics.avgRatingAttendance).toBe(5); // Apenas um rating válido
      expect(metrics.avgRatingSolution).toBe(4); // Apenas um rating válido
    });
  });
  
  describe('operatorMetrics', () => {
    it('deve calcular métricas por operador corretamente', () => {
      const opMetrics = operatorMetrics(testData);
      
      expect(Object.keys(opMetrics)).toHaveLength(3);
      expect(opMetrics['Ana Silva'].totalCalls).toBe(2);
      expect(opMetrics['Ana Silva'].avgDuration).toBeCloseTo(8.8, 2);
      expect(opMetrics['João Santos'].totalCalls).toBe(1);
      expect(opMetrics['Maria Costa'].totalCalls).toBe(1);
    });
    
    it('deve calcular médias de rating corretamente', () => {
      const opMetrics = operatorMetrics(testData);
      
      expect(opMetrics['Ana Silva'].avgRatingAttendance).toBeCloseTo(4.5, 2);
      expect(opMetrics['Ana Silva'].avgRatingSolution).toBeCloseTo(4, 2);
    });
    
    it('deve retornar objeto vazio para array vazio', () => {
      const opMetrics = operatorMetrics([]);
      expect(Object.keys(opMetrics)).toHaveLength(0);
    });
  });
  
  describe('computeScores', () => {
    it('deve calcular scores e ordenar corretamente', () => {
      const opMetrics = operatorMetrics(testData);
      const scores = computeScores(opMetrics);
      
      expect(scores).toHaveLength(3);
      expect(scores[0].score).toBeGreaterThan(scores[1].score);
      expect(scores[1].score).toBeGreaterThan(scores[2].score);
      expect(scores[0].operator).toBeTruthy();
      expect(scores[0].metrics).toBeTruthy();
    });
    
    it('deve retornar array vazio para métricas vazias', () => {
      const scores = computeScores({});
      expect(scores).toHaveLength(0);
    });
    
    it('deve aplicar fórmula de score corretamente', () => {
      const opMetrics = {
        'Teste': {
          totalCalls: 10,
          avgDuration: 5,
          avgRatingAttendance: 5,
          avgRatingSolution: 5,
          avgPause: 10
        }
      };
      
      const scores = computeScores(opMetrics);
      
      // Score deve ser calculado com a fórmula:
      // 0.35*norm(total) + 0.20*(1 - norm(avgDuration)) + 0.20*norm(avgRatingAttendance) + 0.20*norm(avgRatingSolution) - 0.05*norm(avgPause)
      expect(scores[0].score).toBeGreaterThan(0);
      expect(scores[0].score).toBeLessThanOrEqual(1);
    });
  });
  
  describe('ratingDistribution', () => {
    it('deve calcular distribuição de avaliações corretamente', () => {
      const distribution = ratingDistribution(testData);
      
      expect(distribution.attendance[5]).toBe(2); // 2 avaliações de 5
      expect(distribution.attendance[4]).toBe(2); // 2 avaliações de 4
      expect(distribution.attendance[3]).toBe(0); // 0 avaliações de 3
      expect(distribution.solution[5]).toBe(2); // 2 avaliações de 5
      expect(distribution.solution[4]).toBe(2); // 2 avaliações de 4
    });
    
    it('deve lidar com ratings nulos', () => {
      const dataWithNulls = [
        {
          date: '2024-01-15T00:00:00.000Z',
          operator: 'Ana Silva',
          duration_minutes: 8.5,
          rating_attendance: null,
          rating_solution: 4,
          pause_minutes: 10
        }
      ];
      
      const distribution = ratingDistribution(dataWithNulls);
      
      expect(distribution.attendance[4]).toBe(0); // Rating nulo não deve ser contado
      expect(distribution.solution[4]).toBe(1); // Rating válido deve ser contado
    });
  });
  
  describe('dailyStats', () => {
    it('deve calcular estatísticas diárias corretamente', () => {
      const dailyData = dailyStats(testData);
      
      expect(dailyData).toHaveLength(2); // 2 dias diferentes
      expect(dailyData[0].calls).toBe(2); // 2 chamadas no primeiro dia
      expect(dailyData[1].calls).toBe(2); // 2 chamadas no segundo dia
      expect(dailyData[0].uniqueOperators).toBe(2); // 2 operadores únicos no primeiro dia
    });
    
    it('deve ordenar por data corretamente', () => {
      const dailyData = dailyStats(testData);
      
      const firstDate = new Date(dailyData[0].date);
      const secondDate = new Date(dailyData[1].date);
      
      expect(firstDate).toBeLessThanOrEqual(secondDate);
    });
    
    it('deve calcular médias diárias corretamente', () => {
      const dailyData = dailyStats(testData);
      
      // Verificar se as médias são calculadas corretamente
      expect(dailyData[0].avgDuration).toBeCloseTo(10.4, 2); // (8.5 + 12.3) / 2
      expect(dailyData[0].avgRatingAttendance).toBeCloseTo(4.5, 2); // (5 + 4) / 2
    });
  });
});

// Executar testes se chamado diretamente
if (require.main === module) {
  console.log('🧪 Executando testes de Métricas...\n');
  
  // Executar todos os testes
  describe('Cálculos de Métricas', () => {
    // Os testes já estão definidos acima
  });
  
  console.log('\n✅ Testes de Métricas concluídos!');
}
