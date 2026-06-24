const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');


exports.register = async (req, res) => {
    
    try {
        //Importação de valores do corpo do pedido HTTP
        const {nome, email, password, tipo} = req.body;

        //Verificação de campos
        if (!nome || !email || !password || !tipo) {
            return res.status(400).json({message: 'Todos os campos são obrigatórios.'});
        }

        
        if (!['agricultor', 'prestador'].includes(tipo)) {
            return res.status(400).json({message: 'Tipo de utilizador inválido.'});
        }

        
        if(password.length < 8) {
            return res.status(400).json({message: 'A password deve ter pelo menos 8 caracteres.'});
        }

        
        const utilizadorExistente = await pool.query('SELECT id FROM utilizador WHERE email = $1', [email]);
        if(utilizadorExistente.rows.length > 0) {
            return res.status(400).json({message: 'O email introduzido já está em uso.'});
        }

        //Criação do hash da palavra-passe, que será guardado na base de dados
        const hashedPassword = await bcrypt.hash(password, 10);

        //Inserção do novo utilizador na base de dados
        const result = await pool.query(
            `
            INSERT INTO utilizador (nome, email, password, tipo)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nome, email, tipo, ativo, data_criacao, ultimo_update
            `,
            [nome, email, hashedPassword, tipo]
        );

        return res.status(200).json({message: "Conta registada com sucesso."});

    } catch (error) {
        //Emissão de erros inesperados
        console.error(error);
        return res.status(500).json({message: 'Erro durante o processo de registo.'});
    }
};

exports.login = async (req, res) => {
    try{

        const {email, password} = req.body;

        if (!email || !password){

            return res.status(400).json({message: "Email e password são obrigatórios."});

        }

        const result = await pool.query('SELECT * FROM utilizador WHERE email = $1', [email]);

        if (result.rows.length === 0) {return res.status(401).json({message: "Email ou password incorretos."});}

        const user = result.rows[0];
        if (!user.ativo){return res.status(403).json({message: "Erro na autenticação: conta inativa."})}

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {return res.status(401).json({message: "Email ou password incorretos."});}
        //Criação do token JWT
        const token = jwt.sign({id: user.id, tipo: user.tipo}, process.env.JWT_SECRET, {expiresIn: '24h'});

        return res.status(200).json({

            message: "Login efetuado com sucesso.",
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo
            }
        });
    }catch (error){

        console.error(error);
        return res.status(500).json({message: "Erro interno do servidor."});
    }
};