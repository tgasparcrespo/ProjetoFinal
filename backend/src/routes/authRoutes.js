const express = require('express');
//Criação de um router, através da classe Router da biblioteca express
const router = express.Router();
//Importação dos controladores
const authController = require('../controllers/authController');
//Criação das rotas, e indicação do controlador de cada uma
router.post('/register', authController.register);

router.post('/login', authController.login);
//Rota para teste de conexão
router.get('/test', (req, res) => {
    console.log("Ping");
    res.json({ ok: true, message: "API a funcionar" });
});

module.exports = router;