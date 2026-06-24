//Importação das variáveis de ambiente definidas no ficheiro .env
require('dotenv').config();

console.log('DB NAME =', process.env.DB_NAME);
//Importação da aplicação express configurada no ficheiro app.js
const app = require('./app');
//Iniciação do servidor na porta definida na variável de ambiente PORT
app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Servidor ativo na porta ${process.env.PORT}`);
});

