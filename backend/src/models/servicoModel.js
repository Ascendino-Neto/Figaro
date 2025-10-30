const db = require('../config/db');

const Servico = {
  create: async (servicoData) => {
    const { nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao, prestador_id } = servicoData;

    try {
      // ✅ MUDANÇA: Usando $1, $2... e RETURNING com JOIN
      const query = `
        INSERT INTO servicos (nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao, prestador_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      console.log('💾 Salvando serviço no PostgreSQL:', servicoData);
      
      // ✅ MUDANÇA: await + db.query
      const result = await db.query(query, [
        nome,
        descricao,
        local_atendimento,
        tecnicas_utilizadas,
        valor,
        tempo_duracao,
        prestador_id
      ]);
      
      const servicoInserido = result.rows[0];
      
      // ✅ MUDANÇA: Busca informações completas em uma query separada
      const selectQuery = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.id = $1
      `;
      
      const completeResult = await db.query(selectQuery, [servicoInserido.id]);
      
      if (completeResult.rows[0]) {
        console.log('✅ Serviço criado com ID:', servicoInserido.id);
        return completeResult.rows[0];
      } else {
        // Fallback: retorna o serviço inserido mesmo sem o join
        console.log('⚠️ Serviço criado, mas erro ao buscar dados completos');
        return servicoInserido;
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error.message);
      throw new Error("Erro ao salvar serviço no banco de dados: " + error.message);
    }
  },

  findByPrestadorId: async (prestador_id) => {
    try {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.prestador_id = $1 
        ORDER BY s.criado_em DESC
      `;
      
      // ✅ MUDANÇA: db.query + async/await
      const result = await db.query(query, [prestador_id]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar serviços do prestador:', error);
      throw error;
    }
  },

  findAll: async () => {
    try {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        ORDER BY s.criado_em DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar todos os serviços:', error);
      throw error;
    }
  },

  // Buscar serviço por ID
  findById: async (id) => {
    try {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.id = $1
      `;
      
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao buscar serviço por ID:', error);
      throw error;
    }
  },

  // Atualizar serviço
  update: async (id, prestador_id, servicoData) => {
    const { nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao } = servicoData;

    try {
      const query = `
        UPDATE servicos 
        SET nome = $1, descricao = $2, local_atendimento = $3, 
            tecnicas_utilizadas = $4, valor = $5, tempo_duracao = $6,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $7 AND prestador_id = $8
        RETURNING *
      `;
      
      const params = [
        nome,
        descricao,
        local_atendimento,
        tecnicas_utilizadas,
        valor,
        tempo_duracao,
        id,
        prestador_id
      ];

      console.log('💾 Atualizando serviço no PostgreSQL:', { id, prestador_id, ...servicoData });

      const result = await db.query(query, params);

      // ✅ MUDANÇA: result.rowCount em vez de this.changes
      if (result.rowCount === 0) {
        throw new Error("Serviço não encontrado ou você não tem permissão para editá-lo");
      }

      // Busca o serviço atualizado com informações completas
      const selectQuery = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.id = $1
      `;
      
      const completeResult = await db.query(selectQuery, [id]);
      
      if (completeResult.rows[0]) {
        console.log('✅ Serviço atualizado com sucesso');
        return completeResult.rows[0];
      } else {
        throw new Error("Serviço atualizado, mas erro ao buscar dados atualizados");
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error.message);
      throw error;
    }
  },

  delete: async (id, prestador_id) => {
    try {
      const query = `
        DELETE FROM servicos 
        WHERE id = $1 AND prestador_id = $2
      `;
      
      const result = await db.query(query, [id, prestador_id]);
      
      // ✅ MUDANÇA: result.rowCount em vez de this.changes
      return { deleted: result.rowCount };
    } catch (error) {
      console.error('❌ Erro ao excluir serviço:', error);
      throw error;
    }
  },

  // Buscar apenas serviços ativos
  findAtivos: async () => {
    try {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.ativo = true
        ORDER BY s.criado_em DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar serviços ativos:', error);
      throw error;
    }
  },

  // Ativar/Desativar serviço
  toggleAtivo: async (id, prestador_id, ativo) => {
    try {
      const query = `
        UPDATE servicos 
        SET ativo = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2 AND prestador_id = $3
        RETURNING *
      `;
      
      const result = await db.query(query, [ativo, id, prestador_id]);
      
      return { 
        updated: result.rowCount,
        message: `Serviço ${ativo ? 'ativado' : 'desativado'} com sucesso`,
        servico: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Erro ao alterar status do serviço:', error);
      throw error;
    }
  },

  // ✅ MÉTODOS ADICIONAIS (úteis para o sistema)
  
  // Buscar serviços por nome (para busca)
  findByNome: async (nome) => {
    try {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.nome ILIKE $1 AND s.ativo = true
        ORDER BY s.nome
      `;
      
      const result = await db.query(query, [`%${nome}%`]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar serviços por nome:', error);
      throw error;
    }
  },

  // Buscar serviços com filtros
  findWithFilters: async (filters = {}) => {
    try {
      let whereConditions = ['s.ativo = true'];
      let params = [];
      let paramCount = 0;

      if (filters.prestador_id) {
        paramCount++;
        whereConditions.push(`s.prestador_id = $${paramCount}`);
        params.push(filters.prestador_id);
      }

      if (filters.local_atendimento) {
        paramCount++;
        whereConditions.push(`s.local_atendimento ILIKE $${paramCount}`);
        params.push(`%${filters.local_atendimento}%`);
      }

      if (filters.valor_max) {
        paramCount++;
        whereConditions.push(`s.valor <= $${paramCount}`);
        params.push(filters.valor_max);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        ${whereClause}
        ORDER BY s.criado_em DESC
      `;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar serviços com filtros:', error);
      throw error;
    }
  },

  // Contar serviços por prestador
  countByPrestador: async (prestador_id) => {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
          COUNT(CASE WHEN ativo = false THEN 1 END) as inativos
        FROM servicos 
        WHERE prestador_id = $1
      `;
      
      const result = await db.query(query, [prestador_id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao contar serviços:', error);
      throw error;
    }
  }
};

module.exports = Servico;