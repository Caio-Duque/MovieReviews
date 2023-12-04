import '../styles/CreateUser.css';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';


export default function Login(){

    const schema = yup.object({
        email: yup.string().email('Email inválido').required('Email obrigatório'),
        password: yup.string().min(2,'Campo Senha Obrigatório').required(),
    });

    const [msg, setMsg] = useState(' ');

    const form = useForm({
        resolver: yupResolver(schema)
    });

    const { register, handleSubmit, formState } = form;

    const {errors} = formState;

    const submit = async (data) => {
        
        try {
            const response = await axios.post('http://localhost:3000/login', data);

            //Extrair o token
            const token = response.data.token;
            sessionStorage.setItem('token', token);
            if(token)
                setMsg('Autenticado');
        } catch (error) {
            setMsg(error.response.data);
        }   
        
    }

    if(msg.toLowerCase().includes('autenticado')){
        return <Navigate to='/filmes' />
    }

    return (
        <>  
            <h2>Entre para acessar os serviços</h2>
            <form onSubmit={handleSubmit(submit)} noValidate>

                <label htmlFor="email" placeholder="email">Email</label>
                <input type="text" id="email" {...register('email')} />
                <p className='erro'>{errors.email?.message}</p>

                <label htmlFor="password">Senha</label>
                <input type="password" id="password" {...register('password')} />
                <p className='erro'>{errors.password?.message}</p>

                <button>Entrar</button>
            </form>
            <p className="server-response">{msg}</p>
            <div className="realizar-cadastro">
                Não possui conta? 
                <Link to="/criar-user">Cadastro</Link>
            </div>
        </>
    )
}