const express = require("express");
const router = express.Router();

const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {getServicos, getServicosEquipa, getServico, iniciarServico, concluirServico, alterarEstado, criarRegisto, alocarEquipamento} = require("../controllers/servicoController");

router.get("/", verifyToken, getServicos);

router.get("/prestador", verifyToken, authorizeRoles("prestador"), getServicosEquipa);

router.get("/:id", verifyToken, getServico);

router.put("/:id/iniciar", verifyToken, authorizeRoles("prestador"), iniciarServico);

router.put("/:id/concluir", verifyToken, authorizeRoles("prestador"), concluirServico);

router.put("/:id/estado", verifyToken, authorizeRoles("prestador"), alterarEstado);

router.post("/:id/registos", verifyToken, authorizeRoles("prestador"), criarRegisto);

router.post("/:id/equipamentos", verifyToken, authorizeRoles("prestador"), alocarEquipamento);

module.exports = router;