require("dotenv").config();
const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cors());

app.listen(3000, () => {
    console.log('Servidor na porta 3000');
});

const User = require('./model/User');

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const jsonPath = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
    const usuariosCadastrados = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));

    for (let user of usuariosCadastrados) {
        if (user.email === email) {
            const passwordValidado = await bcrypt.compare(password, user.password);
            if (passwordValidado) {
                const token = jwt.sign(user, process.env.TOKEN);
                return res.json({ "token": token });
            } else {
                return res.status(422).send(`Usuario ou senha incorretos.`);
            }
        }
    }
    return res.status(409).send(`Usuario com email ${email} não existe. Considere criar uma conta!`);
});

app.post('/create', async (req, res) => {
    const { username, email, password } = req.body;
    const jsonPath = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
    const usuariosCadastrados = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));

    for (let users of usuariosCadastrados) {
        if (users.email === email) {
            return res.status(409).send(`Usuario com email ${email} já existe.`);
        }
    }

    const id = usuariosCadastrados.length + 1;
    const salt = await bcrypt.genSalt(10);
    const passwordCrypt = await bcrypt.hash(password, salt);

    const user = new User(id, username, email, passwordCrypt);

    usuariosCadastrados.push(user);
    fs.writeFileSync(jsonPath, JSON.stringify(usuariosCadastrados, null, 2));
    res.send(`Tudo certo usuario criado com sucesso.`);
});

app.get('/filmes', verificaToken, (req, res) => {
    const jsonPath = path.join(__dirname, '.', 'db', 'filmes.json');
    const filmes = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));
    return res.json(filmes);
});

app.get('/filmes/:titulo', verificaToken, (req, res) => {
    const jsonPath = path.join(__dirname, '.', 'db', 'filmes.json');
    const filmes = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));

    const params = req.params;
    for (let filme of filmes) {
        if (params.titulo.toUpperCase() === filme.titulo.toUpperCase()) {
            return res.json(filme);
        }
    }
    return res.status(403).send(`Filme Não Encontrado!`);
});

function verificaToken(req, res, next) {
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1];

    if (token == null) return res.status(401).send('Acesso Negado');

    jwt.verify(token, process.env.TOKEN, (err) => {
        if (err) return res.status(403).send('Token Inválido/Expirado');
        next();
    });
}
