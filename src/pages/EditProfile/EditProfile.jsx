import './EditProfileStyle.scss'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export const EditProfile = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [userId, setUserId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        avatarUrl: '',
        password: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [loading, setLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        const userIndex = localStorage.getItem('userIndex')
        if (userIndex && userIndex !== 'null') {
            setUserId(userIndex)
            fetchUserData(userIndex)
        } else {
            navigate('/login')
        }
    }, [])

    const fetchUserData = async (userIndex) => {
        try {
            const response = await axios.get(`https://six7keybackendnodejs.onrender.com/user/${userIndex}`)
            if (response.data && !response.data.message) {
                setUser(response.data)
                setFormData({
                    name: response.data.name,
                    avatarUrl: response.data.avatarUrl || '',
                    password: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            }
        } catch (error) {
            console.error('Ошибка получения данных:', error)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.password) {
            setMessage('❌ Введите текущий пароль для подтверждения')
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        // Проверка пароля
        if (formData.password !== user.password) {
            setMessage('❌ Неверный текущий пароль')
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        // Проверка нового пароля
        if (formData.newPassword) {
            if (formData.newPassword.length < 4) {
                setMessage('❌ Новый пароль должен содержать минимум 4 символа')
                setMessageType('error')
                setTimeout(() => setMessage(''), 3000)
                return
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage('❌ Пароли не совпадают')
                setMessageType('error')
                setTimeout(() => setMessage(''), 3000)
                return
            }
        }

        setLoading(true)

        try {
            const updateData = {
                avatarUrl: formData.avatarUrl,
                name: formData.name,
                password: formData.newPassword || formData.password,
                balance: user.balance
            }

            const response = await axios.put(`https://six7keybackendnodejs.onrender.com/user/edit/${userId}`, updateData)
            
            if (response.data) {
                setMessage('✅ Профиль успешно обновлен!')
                setMessageType('success')
                
                // Обновляем localStorage
                localStorage.setItem('userName', formData.name)
                
                // Обновляем данные пользователя
                setUser({
                    ...user,
                    name: formData.name,
                    avatarUrl: formData.avatarUrl,
                    password: formData.newPassword || formData.password
                })
                
                setFormData({
                    ...formData,
                    password: '',
                    newPassword: '',
                    confirmPassword: ''
                })
                
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (error) {
            console.error('Ошибка обновления:', error)
            setMessage('❌ Ошибка при обновлении профиля')
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setLoading(true)
        
        try {
            const response = await axios.delete(`https://six7keybackendnodejs.onrender.com/user/${userId}`)
            
            if (response.data) {
                // Очищаем localStorage
                localStorage.removeItem('userIndex')
                localStorage.removeItem('userName')
                
                setMessage('✅ Аккаунт успешно удален! Перенаправление...')
                setMessageType('success')
                
                setTimeout(() => {
                    navigate('/register')
                }, 2000)
            }
        } catch (error) {
            console.error('Ошибка удаления:', error)
            setMessage('❌ Ошибка при удалении аккаунта')
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
        } finally {
            setLoading(false)
            setShowDeleteConfirm(false)
        }
    }

    if (!user) {
        return (
            <div className="loading-page">
                <div className="loader"></div>
                <p>Загрузка профиля...</p>
            </div>
        )
    }

    return (
        <div className="edit-profile-page">
            <div className="auras">
                <div className="aura aura-1"></div>
                <div className="aura aura-2"></div>
                <div className="aura aura-3"></div>
            </div>

            <div className="edit-profile-container">
                {/* Заголовок */}
                <div className="profile-header">
                    <h1>👤 Редактирование профиля</h1>
                    <p>Измените свои данные</p>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="profile-form glass-card">
                    {/* Аватар */}
                    <div className="form-group avatar-group">
                        <label>🖼️ Аватар (URL)</label>
                        <input
                            type="url"
                            name="avatarUrl"
                            placeholder="https://example.com/avatar.jpg"
                            value={formData.avatarUrl}
                            onChange={handleChange}
                        />
                        {formData.avatarUrl && (
                            <div className="avatar-preview">
                                <span>Предпросмотр:</span>
                                <img src={formData.avatarUrl} alt="avatar" />
                            </div>
                        )}
                    </div>

                    {/* Имя */}
                    <div className="form-group">
                        <label>👤 Имя пользователя</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Текущий пароль */}
                    <div className="form-group">
                        <label>🔒 Текущий пароль (обязательно)</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Введите текущий пароль"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Новый пароль */}
                    <div className="form-group">
                        <label>🆕 Новый пароль (оставьте пустым, чтобы не менять)</label>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="Новый пароль"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Подтверждение пароля */}
                    <div className="form-group">
                        <label>✓ Подтверждение нового пароля</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Повторите новый пароль"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Информация об аккаунте */}
                    <div className="account-info">
                        <div className="info-item">
                            <span className="info-label">📅 Дата регистрации:</span>
                            <span className="info-value">{user.createdAt || 'Неизвестно'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">💰 Баланс:</span>
                            <span className="info-value">{user.balance} монет</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">🎁 Активировано промокодов:</span>
                            <span className="info-value">{user.activedPromoCodes?.length || 0}</span>
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="form-buttons">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? '💾 Сохранение...' : '💾 Сохранить изменения'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
                            ❌ Отмена
                        </button>
                    </div>
                </form>

                {/* Опасная зона - удаление аккаунта */}
                <div className="danger-zone glass-card">
                    <h3>⚠️ Опасная зона</h3>
                    <p>Удаление аккаунта приведет к безвозвратной потере всех данных и прогресса.</p>
                    
                    {!showDeleteConfirm ? (
                        <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                            🗑️ Удалить аккаунт
                        </button>
                    ) : (
                        <div className="delete-confirm">
                            <p>❗ Вы уверены? Это действие необратимо!</p>
                            <div className="confirm-buttons">
                                <button className="confirm-delete" onClick={handleDeleteAccount} disabled={loading}>
                                    Да, удалить
                                </button>
                                <button className="cancel-delete" onClick={() => setShowDeleteConfirm(false)}>
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Сообщение */}
                {message && (
                    <div className={`message ${messageType}`}>
                        <span>{messageType === 'success' ? '✅' : '❌'}</span>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}