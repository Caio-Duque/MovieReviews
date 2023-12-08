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

app.post('/avaliacoes', verificaToken, async (req, res) => {
    const { filmeId, nota, comentario } = req.body;
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);

    const jsonPathAvaliacoes = path.join(__dirname, '.', 'db', 'avaliacoes.json');
    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');

    const avaliacoes = JSON.parse(fs.readFileSync(jsonPathAvaliacoes, { encoding: 'utf8', flag: 'r' }));
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

    const usuario = usuarios.find((user) => user.id === decoded.id);

    if (!usuario) {
        return res.status(404).send('Usuário não encontrado.');
    }

    const novaAvaliacao = new Avaliacao(
        avaliacoes.length + 1,
        decoded.id,
        filmeId,
        nota,
        comentario,
        usuario.username 
    );

    avaliacoes.push(novaAvaliacao);
    fs.writeFileSync(jsonPathAvaliacoes, JSON.stringify(avaliacoes, null, 2));

    res.send('Avaliação cadastrada com sucesso.');
});

app.put('/avaliacoes/:avaliacaoId', verificaToken, async (req, res) => {
    const { nota, comentario } = req.body;
    const { avaliacaoId } = req.params;
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);

    const jsonPathAvaliacoes = path.join(__dirname, '.', 'db', 'avaliacoes.json');
    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');

    const avaliacoes = JSON.parse(fs.readFileSync(jsonPathAvaliacoes, { encoding: 'utf8', flag: 'r' }));
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

    const usuario = usuarios.find((user) => user.id === decoded.id);

    if (!usuario) {
        return res.status(404).send('Usuário não encontrado.');
    }

    const avaliacaoIndex = avaliacoes.findIndex(avaliacao => avaliacao.id == avaliacaoId);

    if (avaliacaoIndex === -1) {
        return res.status(404).send('Avaliação não encontrada.');
    }

    if (avaliacoes[avaliacaoIndex].userId !== decoded.id) {
        return res.status(403).send('Você não tem permissão para editar esta avaliação.');
    }

    avaliacoes[avaliacaoIndex].nota = nota;
    avaliacoes[avaliacaoIndex].comentario = comentario;

    fs.writeFileSync(jsonPathAvaliacoes, JSON.stringify(avaliacoes, null, 2));

    res.send('Avaliação atualizada com sucesso.');
});

app.delete('/avaliacoes/:avaliacaoId', verificaToken, (req, res) => {
    const { avaliacaoId } = req.params;
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);

    const jsonPathAvaliacoes = path.join(__dirname, '.', 'db', 'avaliacoes.json');
    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');

    const avaliacoes = JSON.parse(fs.readFileSync(jsonPathAvaliacoes, { encoding: 'utf8', flag: 'r' }));
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

    const usuario = usuarios.find((user) => user.id === decoded.id);

    if (!usuario) {
        return res.status(404).send('Usuário não encontrado.');
    }

    const avaliacaoIndex = avaliacoes.findIndex(avaliacao => avaliacao.id == avaliacaoId);

    if (avaliacaoIndex === -1) {
        return res.status(404).send('Avaliação não encontrada.');
    }

    if (avaliacoes[avaliacaoIndex].userId !== decoded.id) {
        return res.status(403).send('Você não tem permissão para excluir esta avaliação.');
    }

    avaliacoes.splice(avaliacaoIndex, 1);

    fs.writeFileSync(jsonPathAvaliacoes, JSON.stringify(avaliacoes, null, 2));

    res.send('Avaliação excluída com sucesso.');
});

app.put('/update-email', verificaToken, async (req, res) => {
    const { newEmail, password } = req.body;
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);

    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

    const usuarioIndex = usuarios.findIndex((user) => user.id === decoded.id);

    if (usuarioIndex === -1) {
        return res.status(404).send('Usuário não encontrado.');
    }

    const passwordValidado = await bcrypt.compare(password, usuarios[usuarioIndex].password);

    if (!passwordValidado) {
        return res.status(403).send('Senha atual incorreta.');
    }

    usuarios[usuarioIndex].email = newEmail;

    fs.writeFileSync(jsonPathUsuarios, JSON.stringify(usuarios, null, 2));

    res.send('Email atualizado com sucesso.');
});

app.put('/update-password', verificaToken, async (req, res) => {
    const { newPassword, password } = req.body;
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);

    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

    const usuarioIndex = usuarios.findIndex((user) => user.id === decoded.id);

    if (usuarioIndex === -1) {
        return res.status(404).send('Usuário não encontrado.');
    }

    const passwordValidado = await bcrypt.compare(password, usuarios[usuarioIndex].password);

    if (!passwordValidado) {
        return res.status(403).send('Senha atual incorreta.');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordCrypt = await bcrypt.hash(newPassword, salt);

    usuarios[usuarioIndex].password = newPasswordCrypt;

    fs.writeFileSync(jsonPathUsuarios, JSON.stringify(usuarios, null, 2));

    res.send('Senha atualizada com sucesso.');
});

app.post('/validate-password', verificaToken, async (req, res) => {
    try {
        const { password } = req.body;
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.TOKEN);

        console.log('Decoded ID:', decoded.id);

        const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
        const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

        const usuario = usuarios.find((user) => user.id === decoded.id);

        console.log('Usuário encontrado:', usuario);

        if (!usuario) {
            return res.status(404).send('Usuário não encontrado.');
        }

        const passwordValidado = await bcrypt.compare(password, usuario.password);

        if (!passwordValidado) {
            return res.status(403).send('Senha incorreta.');
        }

        res.send('Senha validada com sucesso.');
    } catch (error) {
        console.error('Erro na rota validate-password:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});

