const pool = require('../config/database');

const createAvaliacao = async (req,res)=>{

    try{

        const{servico_id, rating, comentario} = req.body;
        //Armazenamento do id do utilizador que fez o pedido HTTP
        const autor_id = req.user.id;

        const servico = await pool.query(
            `
            SELECT * FROM servico WHERE id = $1
            `, [servico_id]
        );

        if (servico.rows.length === 0) {

            return res.status(404).json({message: "Serviço não encontrado."});

        }

        const avaliacaoExistente = await pool.query(
            `
            SELECT * FROM Avaliacao
            WHERE servico_id = $1
            AND autor = $2
            `, [servico_id, autor_id]
        );

        if (avaliacaoExistente.rows.length > 0) {

            return res.status(400).json({message: "Já avaliou este serviço."});

        }

        const result = await pool.query(
            `
            INSERT INTO Avaliacao(servico_id, autor_id, rating, comentario)
            VALUES ($1, $2, $3, $4) RETURNING *
            `, [servico_id, autor_id, rating, comentario]
        );

        res.status(201).json(result.rows[0]);


    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao criar avaliação."});
    }
}

const getServicoAvaliacoes = async (req,res)=>{

    try{
        //Armazenamento do id do serviço, enviado nos parâmetros do pedido HTTP
        const{id} = req.params;

        const result = await pool.query(
            `
            SELECT a.*, u.nome
            FROM Avaliacao a JOIN Uitlizador u
            ON u.id = a.autor_id
            WHERE a.servico_id = $1
            `, [id]
        );

        res.status(200).json(result.rows);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao consultar avaliações."});

    }
}

module.exports = {createAvaliacao, getServicoAvaliacoes};