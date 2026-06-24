const jwt = require('jsonwebtoken');

//Middleware para verificar o token JWT enviado pelo cliente
const verifyToken = (req, res, next) => {

    try{

        const authHeader = req.headers.authorization;

        //Verificar se o token foi enviado
        if(!authHeader){

            return res.status(401).json({

                message: "Token não fornecido."

            });
        }
        //Guardar contéudo do token
        const token = authHeader.split(' ')[1];

        //Verificar se existe conteúdo do token
        if(!token){

            return res.status(401).json({message: "Token inválido."});
            
        }
        //Descodificar informação do utilizador com o conteúdo do token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        //Continuação para o próximo middleware, ou para o controlador
        next();

    }catch(error) {

        return res.status(401).json({message: "Token inválido ou expirado."});

    }
};

module.exports = verifyToken;