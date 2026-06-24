const express = require('express');

const router = express.Router();

const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {createEquipa, getMyEquipas, getEquipaMembros, convidarMembro, responderConvite} = require("../controllers/equipaController");

router.post("/", verifyToken, authorizeRoles('prestador'), createEquipa);

router.get("/", verifyToken, authorizeRoles('prestador'), getMyEquipas);

router.get("/:id/membros", verifyToken, authorizeRoles('prestador'), getEquipaMembros);

router.post("/:id/convites", verifyToken, authorizeRoles('prestador'), convidarMembro);

router.put("/convites/:id", verifyToken, authorizeRoles('prestador'), responderConvite);

module.exports = router;
