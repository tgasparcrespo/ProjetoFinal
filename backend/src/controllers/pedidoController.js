const pool = require('../config/database');


const createPedido = async (req, res) => {

    try{
        const {descricao, localizacao, data_pretendida} = req.body;

        const agricultor_id = req.user.id;

        const result = await pool.query(
            `
            INSERT INTO PedidoServico (descricao, localizacao, data_pretendida, agricultor_id)
            VALUES( $1, $2, $3, $4)
            RETURNING *
            `, [descricao, localizacao, data_pretendida, agricultor_id]
        );

            res.status(201).json(result.rows[0]);

    }catch(error) {

        console.error(error);

        res.status(500).json({message: "Erro ao criar pedido."});
    }
};

const getPedidos = async (req, res) => {

    try {
        
        let result;

        //Verificar se o utilizador é agricultor; se sim, recebe apenas os seus pedidos, caso contrário recebe todos os pedidos
        if(req.user.tipo === "agricultor") {
            result = await pool.query(
                `
                SELECT * FROM PedidoServico WHERE agricultor_id = $1
                `, [req.user.id]
            );            
        }
        else {
            result = await pool.query(
                `
                SELECT * FROM PedidoServico
                ORDER BY id DESC
                `
            );
        }

        res.status(200).json(result.rows);

    }catch (error) {

        console.error(error);

        res.status(500).json({message: "Erro ao consultar pedidos."});

    }
};

const getPedidoById = async (req, res) => {

    try {
        const {id} = req.params;

        const result = await pool.query(
            `
            SELECT * FROM PedidoServico WHERE id = $1
            `, [id]
        );
        //Verificar se o pedido existe
        if(result.rows.lenght === 0) {
            return res.status(400).json({message: "Pedido não encontrado."});
        }

        res.status(200).json(result.rows[0]);

    }catch(error){

        console.error(error);

        res.status(500).json({message: "Erro ao consultar pedido."});
    }
};

const updatePedido = async (req, res) => {

    try{

        const {id} = req.params;

        const {descricao, localizacao, data_pretendida} = req.body;

        const pedido = await pool.query(
            `
            SELECT * FROM PedidoServico WHERE id = $1
            `, [id]
        );

        if(pedido.rows.length === 0) {

            return res.status(400).json({message: "Pedido não encontrado."});

        }

        const pedidoAtual = pedido.rows[0];

        //Verificar se o utilizador é o agricultor que criou o pedido
        if(pedidoAtual.agricultor_id !== req.user.id) {
            return res.status(403).json({message: "Acesso negado: apenas o agricultor que criou o pedido pode alterá-lo."});
        }

        //Verificar o estado do pedido; apenas pedidos com estado "pendente" podem ser editados
        if(pedidoAtual.estado !== 'pendente') {
            return res.status(400).json({message: "Apenas pedidos em estado pendente podem ser editados."});
        }

        const result = await pool.query(
            `
            UPDATE PedidoServico
            SET 
            descricao = $1,
            localizacao = $2,
            data_pretendida= $3
            WHERE id = $4
            RETURNING *
            `, [descricao, localizacao, data_pretendida, id]
        );

        res.status(200).json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao atualizar pedido."});
    }
};

const deletePedido = async (req, res) => {
    
    try{

        const {id} = req.params;
        const pedido = await pool.query(
            `
            SELECT * FROM PedidoServico WHERE id = $1
            `, [id]
        );

        if(pedido.rows.length === 0) {
            return res.status(404).json({message: "Pedido não encontrado."});
        }

        const pedidoAtual = pedido.rows[0];

        if(pedidoAtual.agricultor_id !== req.user.id){

            return res.status(403).json({message: "Acesso negado: apenas o agricultor que criou o pedido pode eliminá-lo."});

        }
    
        if(pedidoAtual.estado !== 'pendente') {

            return res.status(400).json({message: "Apenas pedidos em estado pendente podem ser eliminados."});

        }

        await pool.query(
            `DELETE FROM PedidoServico WHERE id = $1`, [id]
        );

        res.status(200).json({message: "Pedido eliminado com sucesso."});

    }catch(error){

        console.error(error);
        res.status(500).json({message: "Erro ao eliminar pedido."});

    }
}; 

module.exports = {
    createPedido,
    getPedidos,
    getPedidoById,
    updatePedido,
    deletePedido
};