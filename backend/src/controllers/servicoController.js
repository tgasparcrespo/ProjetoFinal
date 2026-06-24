const pool = require("../config/database");

const getServicos = async (req, res) => {
    try {
        const agricultor_id = req.user.id;
        
        const result = await pool.query(
            `SELECT * FROM servico WHERE agricultor_id = $1 ORDER BY id DESC`,
            [agricultor_id]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao consultar serviços." });
    }
};

const getServico = async (req,res)=>{

    try{

        const {id} = req.params;

        const result = await pool.query(`SELECT * FROM servico WHERE id = $1`, [id]);

        if (result.rows.length === 0) {

            return res.status(404).json({message: "Serviço não encontrado."});

        }

        res.status(200).json(result.rows[0]);


    }catch(error){

        console.error(error);
        res.status(500).json({message:"Erro ao consultar serviço."});

    }
}

const iniciarServico = async (req,res)=>{

    try{

        const {id} = req.params;

        const servico = await pool.query(`SELECT * FROM servico WHERE id = $1`, [id]);

        if (servico.rows.length === 0) {

            return res.status(404).json({message: "Serviço não encontrado."});

        }

        await pool.query(
            `
            UPDATE Servico
            SET data_inicio = NOW(), estado = $2
            WHERE id = $1
            `, [id, "em_execucao"]
        );

        await pool.query(
            `
            INSERT INTO EstadoServico (servico_id, estado, descricao)
            VALUES ($1, $2, $3)
            `, [id, "em_execucao", "Serviço iniciado"]
        );

        res.status(200).json({message: "Serviço iniciado"});

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao iniciar serviço."});

    }
}

const alterarEstado = async (req,res)=>{

    try{

        const {id} = req.params;

        const {estado, descricao} = req.body;

        const servico = await pool.query(`SELECT * FROM servico WHERE id = $1`, [id]);

        if (servico.rows.length === 0) {

            return res.status(404).json({message: "Serviço não encontrado."});

        }


        const result = await pool.query(
            `
            INSERT INTO EstadoServico (servico_id, estado, descricao)
            VALUES ($1, $2, $3) RETURNING *
            `, [id, estado, descricao]
        );

        res.status(201).json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao atualizar estado."});
    }
}

const criarRegisto = async (req,res)=>{

    try{

        const{id} = req.params;
        const {tipo, conteudo} = req.body;

        
        const servico = await pool.query(`SELECT * FROM servico WHERE id = $1`, [id]);

        if (servico.rows.length === 0) {

            return res.status(404).json({message: "Serviço não encontrado."});

        }
        
        
        const result = await pool.query(
            `
            INSERT INTO RegistoServico (servico_id, tipo, conteudo)
            VALUES ($1, $2, $3) RETURNING *
            `, [id, tipo, conteudo]
        );


        res.status(201).json(result.rows[0]);



    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao adicionar registo."});

    }

}

const alocarEquipamento = async (req,res)=>{

    try{

        const {id} = req.params;
        const {equipamento_id, horas_servico} =  req.body;

        const servico = await pool.query(`SELECT * FROM servico WHERE id = $1`, [id]);

        if (servico.rows.length === 0) {

            return res.status(404).json({message: "Serviço não encontrado."});

        }

        
        const result = await pool.query(
            `
            INSERT INTO AlocacaoRecurso(servico_id, equipamento_id, horas_servico)
            VALUES ($1, $2, $3) RETURNING *
            `, [id, equipamento_id, horas_servico]
        );


        await pool.query(
            `
            UPDATE Equipamento
            SET estado = $1 WHERE id = $2
            `, ["nao_disponivel", equipamento_id]
        );

        res.status(201).json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao alocar equipamento."});
    }
}

const concluirServico = async (req,res)=>{

    try{

        const {id} = req.params;
        
        const servico = await pool.query(`SELECT * FROM servico WHERE id = $1`, [id]);

        if (servico.rows.length === 0) {

            return res.status(404).json({message: "Serviço não encontrado."});

        }

        await pool.query(
            `
            UPDATE Servico 
            SET data_fim = NOW()
            WHERE id = $1
            `, [id]
        );

        await pool.query(
            `
            INSERT INTO EstadoServico (servico_id, estado, descricao)
            VALUES ($1, $2, $3)
            `, [id, "concluido", "Serviço concluído"]
        );

        const equipamentos = await pool.query(
            `
            SELECT equipamento_id
            FROM AlocacaoRecurso
            WHERE servico_id = $1
            `, [id]
        );
        

        for (const e of equipamentos.rows) {

            await pool.query(
                `
                UPDATE Equipamento
                SET estado = $1
                WHERE id = $2
                `, ["disponivel", e.equipamento_id]
            );


        }


        res.status(200).json({message: "Serviço concluído."});


    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao concluir serviço."});
    }
}


const getServicosEquipa = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, p.descricao, p.localizacao 
             FROM servico s
             JOIN equipa e ON e.id = s.equipa_id
             LEFT JOIN PedidoServico p ON p.id = s.pedido_id
             WHERE e.prestador_id = $1
             ORDER BY s.id DESC`,
            [req.user.id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao consultar serviços da equipa." });
    }
};

module.exports = {getServicos, getServicosEquipa, getServico, iniciarServico, concluirServico, alterarEstado, criarRegisto, alocarEquipamento};