//Middleware que verifica se o utilizador tem permissões para fazer determinadas ações, através do seu tipo (prestador, agricultor ou admin);
//É utilizado um parâmetro Rest, para guardar um número indefinido de valores, armazenados no array roles
const authorizeRoles = (...roles) => {

    return (req, res, next) => {
        //Verifica se o tipo do utilizador se encontra na lista de tipos autorizados para a ação
        if(!roles.includes(req.user.tipo)){return res.status(403).json({message: "Utilizador sem permissões para esta ação."});}

        next();
    }

};

module.exports = authorizeRoles;

