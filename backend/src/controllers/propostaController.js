const pool = require("../config/database");

const createProposta = async (req, res) => {

    try{

        const {pedido_id, equipa_id, preco, data_execucao} = req.body;

        const pedido = await pool.query(`SELECT * FROM pedidoServico WHERE id = $1`, [pedido_id]);

        if (pedido.rows.length === 0){
            return res.status(400).json({message: "Pedido não encontrado."});
        }

        const proposta = await pool.query(
            `
            INSERT INTO Proposta (pedido_id, equipa_id, preco, data_execucao)
            VALUES ($1, $2, $3, $4) RETURNING *
            `, [pedido_id, equipa_id, preco, data_execucao]
        );

        await pool.query(`UPDATE PedidoServico SET estado = 'em_proposta' WHERE id = $1`, [pedido_id]);

        res.status(201).json(proposta.rows[0]);

    }catch(error){
        
        console.error(error);

        res.status(500).json({message: "Erro ao criar proposta."});

    }
}

const getPropostasPedido = async (req, res) => {

    try{

        const {id} = req.params;
        const pedido = await pool.query(`SELECT * FROM pedidoServico WHERE id = $1`, [id]);
        if(pedido.rows.length === 0){
            return res.status(404).json({message: "Pedido não encontrado."});
        }

        const propostas = await pool.query(`SELECT * FROM Proposta WHERE pedido_id = $1`, [id]);

        res.status(200).json(propostas.rows);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao consultar propostas."});

    }
}

const aceitarProposta = async (req, res) => {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    const propostaRes = await client.query(
      `SELECT * FROM Proposta WHERE id = $1`,
      [id]
    );

    if (propostaRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Proposta não encontrada." });
    }

    const proposta = propostaRes.rows[0];

    
    await client.query(
      `UPDATE Proposta SET estado = 'aceite' WHERE id = $1`,
      [id]
    );

    
    await client.query(
      `UPDATE Proposta 
       SET estado = 'rejeitada' 
       WHERE pedido_id = $1 AND id <> $2`,
      [proposta.pedido_id, id]
    );

    
    await client.query(
      `UPDATE PedidoServico 
       SET estado = 'em_execucao' 
       WHERE id = $1`,
      [proposta.pedido_id]
    );

    
    const pedidoRes = await client.query(
      `SELECT agricultor_id FROM PedidoServico WHERE id = $1`,
      [proposta.pedido_id]
    );

    const agricultor_id = pedidoRes.rows[0].agricultor_id;

    
    const servico = await client.query(
      `INSERT INTO Servico 
       (pedido_id, proposta_id, agricultor_id, equipa_id) 
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        proposta.pedido_id,
        id,
        agricultor_id,
        proposta.equipa_id
      ]
    );


    await client.query("COMMIT");

    return res.status(200).json(servico.rows[0]);

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    return res.status(500).json({
      message: "Erro ao aceitar proposta"
    });

  } finally {
    client.release();
  }
}

const rejeitarProposta = async (req, res) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const { id } = req.params;

    const propostaRes = await client.query(
      `SELECT * FROM Proposta WHERE id = $1`,
      [id]
    );

    if (propostaRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Proposta não encontrada." });
    }

    const proposta = propostaRes.rows[0];

    
    await client.query(
      `UPDATE Proposta SET estado = 'rejeitada' WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Proposta rejeitada com sucesso"
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    return res.status(500).json({
      message: "Erro ao rejeitar proposta"
    });

  } finally {
    client.release();
  }
};

const getPropostasEquipa = async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT p.*, ps.descricao, ps.localizacao, ps.data_pretendida, e.nome as equipa_nome
       FROM Proposta p
       JOIN Equipa e ON e.id = p.equipa_id
       LEFT JOIN PedidoServico ps ON ps.id = p.pedido_id
       WHERE e.prestador_id = $1
       ORDER BY p.id DESC`,
      [req.user.id]
    );

    res.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Erro ao consultar propostas"
    });

  }

};

module.exports = {createProposta, getPropostasPedido, getPropostasEquipa, aceitarProposta, rejeitarProposta};