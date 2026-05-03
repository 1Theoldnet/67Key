import './RegisterStyles.scss'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const Register = () => {
    const nav = useNavigate()

    const [values, setValues] = useState({
        avatarUrl: '',
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
        <div className='register-page'>
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

                axios.post('https://six7keybackendnodejs.onrender.com/user/register', { avatarUrl: values.avatarUrl, name: values.name, password: values.password, createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() })
                .then(res => {
                    if(res.data.message === 'Пользователь успешло создан!') {
                        setValues({ avatarUrl: '', name: '', password: '' })
                        setError('')
                        nav('/login')
                    } else if(res.data.message === 'Такой пользователь уже существует!') {
                        setError('Такой пользователь уже существует!')
                    }
                })
            }}>
                <b>Регистрация 67key</b>
                <input type='url' placeholder='🔗 Ссылка на картинку (необязательно)' value={values.avatarUrl} onChange={e => setValues({ ...values, avatarUrl: e.target.value })} />
                <input type='text' placeholder='👤 Имя' value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} />
                <input type='password' placeholder='🔒 Пароль' value={values.password} onChange={e => setValues({ ...values, password: e.target.value })} />
                {error.trim() !== '' && <p style={{ color: 'red' }}>⚠️ {error}</p>}
                <button>Зарегистрироваться</button>
            </form>

            <div style={{ position: 'fixed', left: 0, bottom: 0, color: 'white', padding: 15, fontSize: 20 }}>
                У вас уже есть аккаунт? <Link to='/login'>Войти</Link>
            </div>
        </div>
    )
}