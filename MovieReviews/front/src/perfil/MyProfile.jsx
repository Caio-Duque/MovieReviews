import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/MyProfile.css';

export default function MyProfile() {
    // Estados para mensagens de sucesso ou erro
    const [msg, setMsg] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // Estado para armazenar o ID do usuário atual
    const [currentUser, setCurrentUser] = useState(null);

    // obter o ID do usuário atual
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
        setCurrentUser(userId);
    }, []);

    // Validação para o formlario de atualização de email
    const emailSchema = yup.object({
        newEmail: yup.string().email('Email inválido').required('Email obrigatório'),
        password: yup.string().required('Senha obrigatória'),
    });

    // Validação para o formulário de atualização de senha
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

    // atualização de email
    const handleUpdateEmail = async (data) => {
        try {
            const token = sessionStorage.getItem('token');

            // Verificar se o token está presente
            if (!token) {
                setUpdateSuccess(false);
                setMsg('Token inválido');
                return;
            }

            // chama o back para atualização de email
            await axios.put(
                'http://localhost:3000/update-email',
                { newEmail: data.newEmail, password: data.password },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setUpdateSuccess(true);
            setMsg('Email atualizado com sucesso.');
        } catch (error) {
            setUpdateSuccess(false);
            if (error.response && error.response.status === 409) {
                setMsg('O email já está associado a outro usuário.');
            } else {
                setMsg('Erro ao atualizar o email. Verifique a senha.');
            }
            console.error('Error updating email:', error);
        }
    };

    // lidar com a atualização de senha
    const handleUpdatePassword = async (data) => {
        try {
            const token = sessionStorage.getItem('token');

            if (!token) {
                setUpdateSuccess(false);
                setMsg('Token inválido');
                return;
            }

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

    // Se não houver usuário atual, exibe mensagem de token inválido
    if (!currentUser) {
        return <p>Token inválido</p>;
    }

    return (
        <div>
            {}
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

            {/* Exibição de mensagens de sucesso ou erro */}
            {updateSuccess && <p style={{ color: 'green' }}>{msg}</p>}
            {!updateSuccess && msg && <p style={{ color: 'red' }}>{msg}</p>}

            {/* Formulário de atualização de email */}
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

            {/* Formulário de atualização de senha */}
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
