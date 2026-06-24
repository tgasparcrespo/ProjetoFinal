const pool = require('../config/database');

const createEquipa = async (req,res) => {
    
    try{

        const {nome} = req.body;

        const prestadorId = req.user.id;

        const result = await pool.query(
            `
            INSERT INTO Equipa (nome, prestador_id)
            VALUES ($1, $2) RETURNING *
            `, [nome, prestadorId]
        );

        await pool.query (`INSERT INTO MembroEquipa (utilizador_id, equipa_id, role) VALUES ($1, $2, $3)`, [req.user.id, result.rows[0].id, "Chefe"]);

        res.status(201).json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao criar equipa."});

    }
}

const getMyEquipas = async (req,res) => {

    try{

        const result = await pool.query(
            `
            SELECT * FROM equipa WHERE prestador_id = $1
            `, [req.user.id]);

            res.status(200).json(result.rows);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao consultar equipas."});

    }
}

const convidarMembro = async (req,res) => {

    try{
        const {id} = req.params;
        const {recetor_id} = req.body;

        const equipa = await pool.query(
            `
            SELECT * FROM equipa WHERE id = $1 AND prestador_id = $2
            `, [id, req.user.id]);
        
        if (equipa.rows.length === 0){

            res.status(403).json({message: "Equipa inválida."});

        }

        const convite = await pool.query(
            `
            INSERT INTO ConviteEquipa (equipa_id, recetor_id)
            VALUES ($1, $2) RETURNING *
            `, [id, recetor_id]
        );

        res.status(201).json(convite.rows[0]);

    }
    catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao convidar membro."});
    }
}

const responderConvite = async (req,res) => {

    try{

        const {id} = req.params;
        const {estado} = req.body;

        const convite = await pool.query(
            `
            SELECT * FROM ConviteEquipa WHERE id = $1
            `, [id]
        );

        if (convite.rows.length === 0){

            res.status(404).json({message: "Erro. Convite não encontrado."});

        }

        const conviteAtual = convite.rows[0];

        await pool.query(
            `
            UPDATE ConviteEquipa
            SET estado = $1
            WHERE id = $2
            `, [estado, id]
        );

        if (estado === 'aceite') {

            await pool.query(
                `
                INSERT INTO MembroEquipa (utilizador_id, equipa_id, role)
                VALUES ($1, $2, $3)
                `, [req.user.id, conviteAtual.equipa_id, "Membro prestador"]);

        }

        res.status(200).json({message: "Convite atualizado."});

    }

    catch(error){
        console.error(error);
        res.status(500).json({message: "Erro ao responder a convite."});
    }
}

const getEquipaMembros = async (req,res) => {

    try{

        const {id} = req.params;

        const result = await pool.query(
            `
            SELECT
            me.id, u.nome, u.email
            FROM MembroEquipa me
            JOIN Utilizador u
            ON u.id = me.utilizador_id
            WHERE me.equipa_id = $1
            `, [id]
        );

        res.status(200).json(result.rows);

    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Erro ao obter membros de equipa."});
    }
}


module.exports = {createEquipa, getMyEquipas, convidarMembro, responderConvite, getEquipaMembros}