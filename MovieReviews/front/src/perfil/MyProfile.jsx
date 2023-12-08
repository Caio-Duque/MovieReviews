import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import '../styles/MyProfile.css';
import { Link } from 'react-router-dom';

export default function MyProfile() {
    const [msg, setMsg] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const emailSchema = yup.object({
        newEmail: yup.string().email('Email inválido').required('Email obrigatório'),
        password: yup.string().required('Senha obrigatória'),
    });

    const passwordSchema = yup.object({
        newPassword: yup.string().min(4, 'Senha com no mínimo 4 caracteres').required('Senha obrigatória'),
        newPasswordConf: yup
            .string()
            .required('Confirme a senha')
            .oneOf([yup.ref('newPassword')], 'As senhas devem coincidir!'),
        password: yup.string().required('Senha obrigatória'),
    });

    const {
        register: registerEmail,
        handleSubmit: handleSubmitEmail,
        formState: { errors: emailErrors },
    } = useForm({
        resolver: yupResolver(emailSchema),
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors },
    } = useForm({
        resolver: yupResolver(passwordSchema),
    });

    const handleUpdateEmail = async (data) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                'http://localhost:3000/update-email',
                { newEmail: data.newEmail, password: data.password },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setUpdateSuccess(true);
            setMsg('Email atualizado com sucesso.');
        } catch (error) {
            setUpdateSuccess(false);
            setMsg('Erro ao atualizar o email. Verifique a senha.');
            console.error('Error updating email:', error);
        }
    };

    const handleUpdatePassword = async (data) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                'http://localhost:3000/update-password',
                { newPassword: data.newPassword, password: data.password },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setUpdateSuccess(true);
            setMsg('Senha atualizada com sucesso.');
        } catch (error) {
            setUpdateSuccess(false);
            setMsg('Erro ao atualizar a senha. Verifique a senha.');
            console.error('Error updating password:', error);
        }
    };

    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <Link to={'/'}>Login</Link>
                    </li>
                    <li>
                        <Link to={'/filmes'}>Filmes</Link>
                    </li>
                </ul>
            </nav>
            <h2>Meu Perfil</h2>

            {updateSuccess && <p style={{ color: 'green' }}>{msg}</p>}
            {!updateSuccess && msg && <p style={{ color: 'red' }}>{msg}</p>}

            <form onSubmit={handleSubmitEmail(handleUpdateEmail)}>
                <label>
                    Novo Email:
                    <input type="text" {...registerEmail('newEmail')} />
                    {emailErrors.newEmail && <p style={{ color: 'red' }}>{emailErrors.newEmail.message}</p>}
                </label>
                <label>
                    Senha Atual:
                    <input type="password" {...registerEmail('password')} />
                    {emailErrors.password && <p style={{ color: 'red' }}>{emailErrors.password.message}</p>}
                </label>
                <button type="submit">Atualizar Email</button>
            </form>

            <form onSubmit={handleSubmitPassword(handleUpdatePassword)}>
                <label>
                    Nova Senha:
                    <input type="password" {...registerPassword('newPassword')} />
                    {passwordErrors.newPassword && (
                        <p style={{ color: 'red' }}>{passwordErrors.newPassword.message}</p>
                    )}
                </label>
                <label>
                    Confirme a Nova Senha:
                    <input type="password" {...registerPassword('newPasswordConf')} />
                    {passwordErrors.newPasswordConf && (
                        <p style={{ color: 'red' }}>{passwordErrors.newPasswordConf.message}</p>
                    )}
                </label>
                <label>
                    Senha Atual:
                    <input type="password" {...registerPassword('password')} />
                    {passwordErrors.password && <p style={{ color: 'red' }}>{passwordErrors.password.message}</p>}
                </label>
                <button type="submit">Atualizar Senha</button>
            </form>
        </div>
    );
}
