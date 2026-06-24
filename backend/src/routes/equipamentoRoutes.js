const express = require("express");
const router = express.Router();

const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {createEquipamento, getEquipamentos, getEquipamentoById, updateEquipamento, deleteEquipamento, getDisponiveis} = require ("../Controllers/equipamentoController");

router.post("/", verifyToken, authorizeRoles("prestador"), createEquipamento);

router.get("/", verifyToken, authorizeRoles("prestador"), getEquipamentos);

router.get("/disponiveis", verifyToken, authorizeRoles("prestador"), getDisponiveis);

router.get("/:id", verifyToken, authorizeRoles("prestador"), getEquipamentoById);

router.put("/:id", verifyToken, authorizeRoles("prestador"), updateEquipamento);

router.delete("/:id", verifyToken, authorizeRoles("prestador"), deleteEquipamento);

module.exports = router;