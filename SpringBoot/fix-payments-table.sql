-- Script para corrigir a tabela payments
-- Execute este script no pgAdmin ou usando psql

-- Dropar a tabela payments (cuidado: isso apaga os dados!)
DROP TABLE IF EXISTS payments CASCADE;

-- O Hibernate irá recriar a tabela corretamente na próxima inicialização
-- com a coluna user_id incluída
