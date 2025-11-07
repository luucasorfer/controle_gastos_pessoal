#!/usr/bin/env node

/**
 * Script para gerar uma chave JWT_SECRET segura
 * Execute com: node generate-secret.mjs
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Chave JWT_SECRET gerada com sucesso!\n');
console.log('Copie a linha abaixo para o seu arquivo .env:\n');
console.log(`JWT_SECRET=${secret}\n`);
console.log('⚠️  Mantenha esta chave em segredo e não compartilhe publicamente!\n');
