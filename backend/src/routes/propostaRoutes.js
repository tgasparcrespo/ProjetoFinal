const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {createProposta, getPropostasPedido, getPropostasEquipa, aceitarProposta, rejeitarProposta} = require("../controllers/propostaController");

router.post("/", verifyToken, authorizeRoles("prestador"), createProposta);

router.get("/prestador", verifyToken, authorizeRoles("prestador"), getPropostasEquipa);

router.get("/:id", verifyToken, getPropostasPedido);

router.put("/:id/aceitar", verifyToken, authorizeRoles("agricultor"), aceitarProposta);

router.put("/:id/rejeitar", verifyToken, authorizeRoles("agricultor"), rejeitarProposta);

module.exports = router;