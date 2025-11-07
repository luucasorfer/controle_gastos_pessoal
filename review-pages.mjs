import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const pagesDir = './client/src/pages';
const issues = [];

console.log('🔍 Iniciando revisão de páginas...\n');

const files = readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = join(pagesDir, file);
  const content = readFileSync(filePath, 'utf-8');
  
  console.log(`📄 Analisando: ${file}`);
  
  // Verificar imports necessários
  if (!content.includes('import { useState }') && content.includes('useState(')) {
    issues.push(`${file}: Falta import de useState`);
  }
  
  // Verificar se tem container para responsividade
  if (!content.includes('className="container') && !content.includes('NotFound') && !content.includes('Home')) {
    issues.push(`${file}: Pode precisar de container para responsividade`);
  }
  
  // Verificar se tem loading states
  if (content.includes('useQuery') && !content.includes('isLoading')) {
    issues.push(`${file}: Query sem tratamento de loading`);
  }
  
  // Verificar formatação de moeda
  if (content.includes('amount') && !content.includes('formatCurrency') && !content.includes('Intl.NumberFormat')) {
    issues.push(`${file}: Valores monetários podem não estar formatados`);
  }
  
  console.log(`  ✓ Análise concluída\n`);
});

console.log('\n📊 Resultado da Revisão:\n');
if (issues.length === 0) {
  console.log('✅ Nenhum problema crítico encontrado!');
} else {
  console.log(`⚠️  ${issues.length} possíveis melhorias identificadas:\n`);
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
}

console.log('\n✨ Revisão concluída!');
