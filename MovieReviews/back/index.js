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

//permite que aceite tanto o ID quanto o título como parâmetro.
app.get('/filmes/:param', verificaToken, (req, res) => {
    const jsonPath = path.join(__dirname, '.', 'db', 'filmes.json');
    const filmes = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));

    const param = req.params.param;

    const filmeEncontrado = filmes.find(filme =>
        filme.id == param || filme.titulo.toUpperCase() === param.toUpperCase()
    );

    if (filmeEncontrado) {
        return res.json(filmeEncontrado);
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

const Avaliacao = require('./model/Avaliacao');


app.get('/avaliacoes/:filmeId', verificaToken, (req, res) => {
    const jsonPath = path.join(__dirname, '.', 'db', 'avaliacoes.json');
    const avaliacoes = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));

    const filmeId = req.params.filmeId;
    const avaliacoesDoFilme = avaliacoes.filter(avaliacao => avaliacao.filmeId == filmeId);

    res.json(avaliacoesDoFilme);
});

app.post('/avaliacoes', verificaToken, (req, res) => {
    const jsonPath = path.join(__dirname, '.', 'db', 'avaliacoes.json');
    const avaliacoes = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));

    const { userId } = req; // Obtendo userId do token
    const { filmeId, nota, comentario } = req.body;

    const novaAvaliacao = {
        id: avaliacoes.length + 1,
        userId,
        filmeId,
        nota,
        comentario,
    };

    avaliacoes.push(novaAvaliacao);
    fs.writeFileSync(jsonPath, JSON.stringify(avaliacoes, null, 2));

    res.json({ message: 'Avaliação criada com sucesso!', avaliacao: novaAvaliacao });
});
