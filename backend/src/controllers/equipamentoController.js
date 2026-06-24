const pool = require("../config/database");

const createEquipamento = async (req,res) => {

    try{

        const {equipa_id, nome, tipo} = req.body;

        const equipa = await pool.query(`SELECT * FROM equipa WHERE id = $1 AND prestador_id = $2` , [equipa_id, req.user.id]);

        if(equipa.rows.length === 0){

            return res.status(403).json({message: "Equipa não encontrada."});

        }

        const result = await pool.query(
            `
            INSERT INTO Equipamento (equipa_id, nome, tipo)
            VALUES ($1, $2, $3) RETURNING *
            `, [equipa_id, nome, tipo]);

        res.status(201).json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao criar equipamento."});

    }
}

const getEquipamentos = async (req,res) => {

    try{

        const result = await pool.query(
            `
            SELECT e.* FROM Equipamento e JOIN Equipa eq ON eq.id = e.equipa_id
            WHERE eq.prestador_id = $1
            `, [req.user.id]);

            res.status(200).json(result.rows);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao consultar equipamentos."});
    }
}

const getEquipamentoById = async (req,res) => {

    try{

        const {id} = req.params;

        const result = await pool.query(
            `
            SELECT * FROM equipamento WHERE id = $1
            `, [id]
        );

        if(result.rows.lenght === 0){

            return res.status(404).json({message: "Equipamento não encontrado."});

        }

        res.status(200).json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao consultar equipamento."});
    }

}

const updateEquipamento = async (req,res) => {

    try{

        const {id} = req.params;

        const {nome, tipo, estado} = req.body;

        const result = await pool.query(
            `
            UPDATE Equipamento
            SET nome = $1, tipo = $2, estado = $3
            WHERE id = $4 RETURNING * 
            `, [nome, tipo, estado, id]
        );

        res.status(200).json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao atualizar equipamento."});
    }

}

const deleteEquipamento = async (req,res) => {

    try{
        
        const {id} = req.params;

        await pool.query(`DELETE FROM equipamento WHERE id = $1`, [id]);

        res.status(200).json({message: "Equipamento removido."});

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao eliminar equipamento."});
    }


}

const getDisponiveis = async (req,res) => {

    try{

        const result = await pool.query(`
            SELECT e.* FROM Equipamento e JOIN Equipa eq ON eq.id = e.equipa_id
            WHERE eq.prestador_id = $1 AND estado = $2
            `, [req.user.id, "disponivel"]);

        if (result.rows.length === 0){
            return res.status(403).json({message: "Não existe equipamento disponível."});
        }
        
        return res.status(200).json(result.rows);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao obter equipamentos disponíveis."});
    }


}

module.exports = {createEquipamento, getEquipamentos, getEquipamentoById, updateEquipamento, deleteEquipamento, getDisponiveis};