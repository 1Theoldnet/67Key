import './LoginStyles.scss'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const Login = () => {
    const nav = useNavigate()

    const [values, setValues] = useState({
        name: '',
        password: ''
    })

    const [error, setError] = useState('')

    useEffect(() => {
        if(localStorage.getItem('userIndex')) {
            nav('/')
            return
        }
    }, [])

    return (
        <div className='login-page'>
            <form onSubmit={e => {
                e.preventDefault()

                if(values.name.trim() === '') {
                    setError('Введите имя пользователя')
                    return
                }

                if(values.name.trim().length < 3) {
                    setError('Имя должно содержать минимум 3 символа')
                    return
                }

                if(values.name.trim().length > 20) {
                    setError('Имя должно содержать максимум 20 символов')
                    return
                }

                const firstLetter = values.name.trim()[0]
                if(firstLetter !== firstLetter.toUpperCase()) {
                    setError('Имя должно начинаться с заглавной буквы')
                    return
                }
                
                const restOfName = values.name.trim().slice(1)
                if(restOfName !== restOfName.toLowerCase()) {
                    setError('Имя должно содержать только первую заглавную букву, остальные строчные')
                    return
                }
                
                const validNameRegex = /^[A-ZА-Я][a-zа-я]*$/
                if(!validNameRegex.test(values.name.trim())) {
                    setError('Имя должно содержать только буквы (латиница или кириллица')
                    return
                }

                if(values.password === '') {
                    setError('Введите пароль')
                    return
                }

                if(values.password.length < 4) {
                    setError('Пароль должен содержать минимум 4 символа')
                    return
                }

                setError('')

                axios.post('https://six7keybackendnodejs.onrender.com/user/login', { name: values.name, password: values.password })
                .then(res => {
                    if(!res.data.message) {
                        setValues({ avatarUrl: '', name: '', password: '' })
                        setError('')
                        localStorage.setItem('userIndex', res.data.userIndex)
                        nav('/')
                    } else if(res.data.message === "Такого пользователя не существует!") {
                        setError("Такого пользователя не существует!")
                    }
                })
            }}>
                <b>Войти в 67key</b>
                <input type='text' placeholder='👤 Имя' value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} />
                <input type='password' placeholder='🔒 Пароль' value={values.password} onChange={e => setValues({ ...values, password: e.target.value })} />
                {error.trim() !== '' && <p style={{ color: 'red' }}>⚠️ {error}</p>}
                <button>Войти</button>
            </form>

            <div style={{ position: 'fixed', left: 0, bottom: 0, color: 'white', padding: 15, fontSize: 20 }}>
                У вас нету аккаунта? <a href='' style={{ color: 'white' }} onClick={() => nav('/register')}>Регистрация</a>
            </div>
        </div>
    )
}