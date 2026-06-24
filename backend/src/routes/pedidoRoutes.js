const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {createPedido, getPedidos, getPedidoById, updatePedido, deletePedido} = require("../controllers/pedidoController");



router.post("/", verifyToken, authorizeRoles("agricultor"), createPedido);


router.get("/", verifyToken, getPedidos);


router.get("/:id", verifyToken, getPedidoById);


router.put("/:id", verifyToken, authorizeRoles("agricultor"), updatePedido);


router.delete("/:id", verifyToken, authorizeRoles("agricultor"), deletePedido);

module.exports = router;