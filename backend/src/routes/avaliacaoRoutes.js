const express = require("express");
const router = express.Router();

const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {createAvaliacao, getServicoAvaliacoes} = require("../controllers/avaliacaoController");
//Criação das rotas, e indicação dos controladores e middlewares de cada uma
router.post("/", verifyToken, createAvaliacao);

router.get("/servico/:id", verifyToken, getServicoAvaliacoes);

module.exports = router;