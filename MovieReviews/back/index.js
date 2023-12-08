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



//login

app.post('/login', async (req, res) => {
    //recebe uma requisição POST contendo email e password.

    const { email, password } = req.body; 

   // passa o caminho e le o arquivo JSON com os usuários cadastrados.
    const jsonPath = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
    const usuariosCadastrados = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));

   // Verifica se o email existe nos usuários cadastrados e se a senha está correta 

    for (let user of usuariosCadastrados) {
        if (user.email === email) {
            const passwordValidado = await bcrypt.compare(password, user.password);
            if (passwordValidado) {    // Se as credenciais estiverem corretas, gera um token JWT e retorna
                const token = jwt.sign(user, process.env.TOKEN);
                return res.json({ "token": token });
            } else {
                return res.status(422).send(`Usuario ou senha incorretos.`);
            }
        }
    }
    return res.status(409).send(`Usuario com email ${email} não existe. Considere criar uma conta!`); //caso nao seja encontrado email associado 
});



//criação de usuário


app.post('/create', async (req, res) => {
    //recebe uma requisição POST contendo usuario, email e password.

    const { username, email, password } = req.body;
   // passa o caminho e le o arquivo JSON com os usuários cadastrados.

    const jsonPath = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
    const usuariosCadastrados = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));

    // verifica se o email já existe

    for (let users of usuariosCadastrados) {
        if (users.email === email) {
            return res.status(409).send(`Usuario com email ${email} já existe.`);
        }
    }

    // gera um ID para o usuário

    const id = usuariosCadastrados.length + 1;

    //criptografa a senha

    const salt = await bcrypt.genSalt(10);
    const passwordCrypt = await bcrypt.hash(password, salt);

    // adiciona o usuário e salva no json


    const user = new User(id, username, email, passwordCrypt);
    usuariosCadastrados.push(user);
    fs.writeFileSync(jsonPath, JSON.stringify(usuariosCadastrados, null, 2));
    res.send(`Tudo certo usuario criado com sucesso.`);
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




//meu perfil


// Atualizar a senha do usuário

app.put('/update-password', verificaToken, async (req, res) => {
    //extrai as informações do corpo da requisição
    const { newPassword, password } = req.body;
    //obtem e decodifica token
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);

    //passa o caminho pro json e lê o arquivo
    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

    //encontra o indce do usuário no array de usuários

    const usuarioIndex = usuarios.findIndex((user) => user.id === decoded.id);


    // verifica se o usuário existe

    if (usuarioIndex === -1) {
        return res.status(404).send('Usuário não encontrado.');
    }

    // compara a senha atual do usuário com a senha enviada na requisição

    const passwordValidado = await bcrypt.compare(password, usuarios[usuarioIndex].password);

    // se a senha atual não for válida, retorna um erro

    if (!passwordValidado) {
        return res.status(403).send('Senha atual incorreta.');
    }
    
    // gera um novo hash para a nova senha

    const salt = await bcrypt.genSalt(10);
    const newPasswordCrypt = await bcrypt.hash(newPassword, salt);
    
    // atualiza a senha do usuário no array de usuários e escreve no json

    usuarios[usuarioIndex].password = newPasswordCrypt;

    fs.writeFileSync(jsonPathUsuarios, JSON.stringify(usuarios, null, 2));

    res.send('Senha atualizada com sucesso.');
});



app.put('/update-email', verificaToken, async (req, res) => {
    const { newEmail, password } = req.body;
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);

    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

    // Verifica se o novo email já está cadastrado para outro usuário
    const emailExists = usuarios.some((user) => user.email === newEmail);

    if (emailExists) {
        return res.status(409).send(`O email ${newEmail} já está associado a outro usuário.`);
    }

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







//listagem de filmes

//pega lista completa de filmes. e retorna

app.get('/filmes', verificaToken, (req, res) => {
    const jsonPath = path.join(__dirname, '.', 'db', 'filmes.json');
    const filmes = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));
    return res.json(filmes);
});



//pega informações especificas do filme com base no ID ou no título. 

app.get('/filmes/:param', verificaToken, (req, res) => {
    const jsonPath = path.join(__dirname, '.', 'db', 'filmes.json');
    const filmes = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));
    
    //parâmetro é extraído da URL para identificar o filme desejado.
    
    const param = req.params.param;

    const filmeEncontrado = filmes.find(filme =>
        filme.id == param || filme.titulo.toUpperCase() === param.toUpperCase()
    );

    if (filmeEncontrado) {
        return res.json(filmeEncontrado);
    }

    return res.status(403).send(`Filme Não Encontrado!`);
});









//moviereviews

const Avaliacao = require('./model/Avaliacao');

//pega as avaliações de um filme específico com base no ID do filme.


app.get('/avaliacoes/:filmeId', verificaToken, (req, res) => {
    const jsonPath = path.join(__dirname, '.', 'db', 'avaliacoes.json');
    const avaliacoes = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8', flag: 'r' }));


    //Filtra as avaliações para obter apenas aquelas relacionadas ao filme específico e retorna

    const filmeId = req.params.filmeId;
    const avaliacoesDoFilme = avaliacoes.filter(avaliacao => avaliacao.filmeId == filmeId);

    res.json(avaliacoesDoFilme);
});



//adiciona nova avaliação para um filme.

app.post('/avaliacoes', verificaToken, async (req, res) => {
    try {

        //pega os dados enviados como id do filme, nota e comentário
        const { filmeId, nota, comentario } = req.body;

        //pega o token e decodifica
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.TOKEN);
        
        // caminho do arquivo JSON 
        const jsonPathAvaliacoes = path.join(__dirname, '.', 'db', 'avaliacoes.json');
        const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');

        //Lê as avaliações do arquivo avaliacoes.json.

        const avaliacoes = JSON.parse(fs.readFileSync(jsonPathAvaliacoes, { encoding: 'utf8', flag: 'r' }));
        const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

        // busca qual usuário está realizando a avaliação

        const usuario = usuarios.find((user) => user.id === decoded.id);

        if (!usuario) {
            return res.status(404).send('Usuário não encontrado.');
        }

        //confere se o usuário já avaliou o filme.

        const userAvaliacao = avaliacoes.find(avaliacao => avaliacao.userId === decoded.id && avaliacao.filmeId === filmeId);
        if (userAvaliacao) {
            return res.status(400).send('Usuário já avaliou este filme.');
        }
      
        // calcula o próximo ID disponivel para a nova avaliação

        const proximoId = avaliacoes.length > 0 ? Math.max(...avaliacoes.map(avaliacao => avaliacao.id)) + 1 : 1;

        //cria e adiciona a avaliaçao
        const novaAvaliacao = new Avaliacao(
            proximoId,
            decoded.id,
            filmeId,
            nota,
            comentario,
            usuario.username 
            );

        avaliacoes.push(novaAvaliacao);

        //escreve no arquivo

        fs.writeFileSync(jsonPathAvaliacoes, JSON.stringify(avaliacoes, null, 2));

        res.send('Avaliação cadastrada com sucesso.');
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).send('Erro interno do servidor.');
    }
});




app.put('/avaliacoes/:avaliacaoId', verificaToken, async (req, res) => {

    // pega as informações de nota e comentarios presentes no corpo da requisição

    const { nota, comentario } = req.body;

    // pega o id da avaliação a ser atualizada

    const { avaliacaoId } = req.params;


    //pega o token e decodofica

    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);

    //passa o caminho pro json

    const jsonPathAvaliacoes = path.join(__dirname, '.', 'db', 'avaliacoes.json');
    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');

    //lê o json
    const avaliacoes = JSON.parse(fs.readFileSync(jsonPathAvaliacoes, { encoding: 'utf8', flag: 'r' }));
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));


    // busca qual usuário está realizando a avaliação

    const usuario = usuarios.find((user) => user.id === decoded.id);

    if (!usuario) {
        return res.status(404).send('Usuário não encontrado.');
    }

    //pega a avaliação
    const avaliacaoIndex = avaliacoes.findIndex(avaliacao => avaliacao.id == avaliacaoId);

    //verifica se existe
    if (avaliacaoIndex === -1) {
        return res.status(404).send('Avaliação não encontrada.');
    }

    // verifica se o usuario que ta atualizando eh o autor da avaliação

    if (avaliacoes[avaliacaoIndex].userId !== decoded.id) {
        return res.status(403).send('Você não tem permissão para editar esta avaliação.');
    }


    // atualiza os campos de nota e comentário na avaliação existente

    avaliacoes[avaliacaoIndex].nota = nota;
    avaliacoes[avaliacaoIndex].comentario = comentario;


    //escreve no json a nova avaliação
    fs.writeFileSync(jsonPathAvaliacoes, JSON.stringify(avaliacoes, null, 2));

    res.send('Avaliação atualizada com sucesso.');
});

app.delete('/avaliacoes/:avaliacaoId', verificaToken, (req, res) => {
    //pega o id da avaliação a ser excluida

    const { avaliacaoId } = req.params;

    //obtem e decodifica o token
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN);


    //passa o caminho pro json
    const jsonPathAvaliacoes = path.join(__dirname, '.', 'db', 'avaliacoes.json');
    const jsonPathUsuarios = path.join(__dirname, '.', 'db', 'banco-dados-usuario.json');

    //le o json
    const avaliacoes = JSON.parse(fs.readFileSync(jsonPathAvaliacoes, { encoding: 'utf8', flag: 'r' }));
    const usuarios = JSON.parse(fs.readFileSync(jsonPathUsuarios, { encoding: 'utf8', flag: 'r' }));

    // busca qual usuário está realizando a avaliação
    const usuario = usuarios.find((user) => user.id === decoded.id);

    if (!usuario) {
        return res.status(404).send('Usuário não encontrado.');
    }
    
    //pega a avaliação

    const avaliacaoIndex = avaliacoes.findIndex(avaliacao => avaliacao.id == avaliacaoId);

    if (avaliacaoIndex === -1) {
        return res.status(404).send('Avaliação não encontrada.');
    }

    // verifica se o usuario que ta atualizando eh o autor da avaliação


    if (avaliacoes[avaliacaoIndex].userId !== decoded.id) {
        return res.status(403).send('Você não tem permissão para excluir esta avaliação.');
    }
    // remove a avaliação do array

    avaliacoes.splice(avaliacaoIndex, 1);

    //deleta do json

    fs.writeFileSync(jsonPathAvaliacoes, JSON.stringify(avaliacoes, null, 2));

    res.send('Avaliação excluída com sucesso.');
});
