import { useEffect, useState } from "react";
import Filme from "./Filme";
import '../styles/ListaFilmes.css';
import axios from 'axios';
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom';

export default function ListaFilmes() {

    const [validado, setValidado] = useState(false);
    const [formData, setFormData] = useState({
        titulo: ' '
    });

    const form = useForm();
    const { register, handleSubmit } = form;

    const submit = (data) => {
        setFormData({ ...formData, ...data });
    }

    const config = {
        headers: {
            'Authorization': 'Bearer '.concat(sessionStorage.getItem('token'))
        }
    }

    useEffect(() => {

        async function valida() {
            try {
                const resposta = await axios.get(`http://localhost:3000/filmes`, config);
                if (resposta.status === 200)
                    setValidado(true);
            } catch (error) {
                setValidado(false);
            }
        }
        valida();
    }, [config]);

    if (!validado) {
        return <p>Token Inválido</p>
    }

    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link to={'/'}>Login</Link>
                    </li>
                    <li>
                        <Link to={'/meu-perfil'}>Meu Perfil</Link>
                    </li>
                </ul>
            </nav>
            <h2>Busque o filme pelo título ou deixe vazio para retornar todos.</h2>
            <form onSubmit={handleSubmit(submit)} noValidate>

                <label htmlFor="titulo" placeholder="titulo">Título</label>
                <input type="text" id="titulo" {...register('titulo')} />

                <button>Listar</button>
            </form>
            <BuscaFilme formData={formData} config={config} />
        </>
    )
}

export function BuscaFilme({ formData, config }) {

    const [msg, setMsg] = useState('');
    const [filmes, setFilmes] = useState(<p>...</p>);
    const view = [];

    useEffect(() => {

        const submit = async () => {
            let endPoint = 'http://localhost:3000/filmes';
            endPoint = `${endPoint}/${formData.titulo}`
            try {
                const dados = await axios.get(`${endPoint}`, config);
                if (Array.isArray(dados.data)) {
                    for (let filme of dados.data) {
                        view.push(<Filme filme={filme} />);
                    }
                } else {
                    view.push(<Filme filme={dados.data} />);
                }
                setFilmes(view);
                setMsg('');
            } catch (error) {
                setMsg(error.response.data);
                setFilmes(<p></p>);

            }
        }
        submit();
    }, [formData, config]);

    return (
        <>
            {filmes}
            {msg}
        </>
    )
}
