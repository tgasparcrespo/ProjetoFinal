const express = require ('express');

//Criação de uma instância da aplicação express
const app = express();
//Middleware que interpreta o JSON dos pedidos HTTP
app.use(express.json());



//Importação das rotas
const authRoutes = require('./routes/authRoutes');

const pedidoRoutes = require("./routes/pedidoRoutes");

const propostaRoutes = require("./routes/propostaRoutes");

const equipaRoutes = require("./routes/equipaRoutes");

const equipamentoRoutes = require("./routes/equipamentoRoutes");

const servicoRoutes = require("./routes/servicoRoutes");

const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
//Utilização das rotas, e a sua associação aos prefixos correspondentes
app.use('/auth', authRoutes);
app.use('/pedidos', pedidoRoutes);
app.use("/propostas", propostaRoutes);
app.use("/equipas", equipaRoutes);
app.use("/equipamentos", equipamentoRoutes);
app.use("/servicos", servicoRoutes);
app.use("/avaliacoes", avaliacaoRoutes);

//Exportação da aplicação, para posterior importação no ficheiro server.js
module.exports = app;