import './UsersStyle.scss'
import { useState, useEffect } from 'react'
import axios from 'axios'

export const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('balance')
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://six7keybackendnodejs.onrender.com/users')
            if (response.data) {
                setUsers(response.data)
            }
        } catch (error) {
            console.error('Ошибка получения пользователей:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortBy === 'balance') {
            return (b.balance || 0) - (a.balance || 0)
        } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name)
        } else if (sortBy === 'date') {
            return new Date(b.createdAt) - new Date(a.createdAt)
        }
        return 0
    })

    const formatDate = (dateString) => {
        if (!dateString) return 'Неизвестно'
        return dateString
    }

    const getBalanceColor = (balance) => {
        if (balance >= 1000) return '#ffd700'
        if (balance >= 500) return '#4caf50'
        if (balance >= 100) return '#8bc34a'
        return '#ff8c42'
    }

    const getAuraColor = (index) => {
        const colors = [
            'linear-gradient(135deg, #ff3366, #ff8c42)',
            'linear-gradient(135deg, #00dbde, #fc00ff)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #fa709a, #fee140)'
        ]
        return colors[index % colors.length]
    }

    return (
        <div className="users-page">
            {/* Фоновые ауры */}
            <div className="auras">
                <div className="aura aura-1"></div>
                <div className="aura aura-2"></div>
                <div className="aura aura-3"></div>
            </div>

            <div className="users-container">
                {/* Заголовок */}
                <div className="users-header">
                    <div className="glow-text">
                        <h1>👥 Галактика пользователей</h1>
                        <div className="header-stats">
                            <span className="stat-badge">✨ {users.length} исследователей</span>
                            <span className="stat-badge">💰 Общий баланс: {users.reduce((sum, u) => sum + (u.balance || 0), 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Поиск и сортировка */}
                <div className="users-controls">
                    <div className="search-box glow-on-hover">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text"
                            placeholder="Поиск по имени..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-btn" onClick={() => setSearchTerm('')}>✖</button>
                        )}
                    </div>
                    
                    <div className="sort-box glow-on-hover">
                        <span className="sort-icon">📊</span>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="balance">💰 По балансу (↓)</option>
                            <option value="name">👤 По имени (А-Я)</option>
                            <option value="date">📅 По дате (новые)</option>
                        </select>
                    </div>
                </div>

                {/* Список пользователей */}
                {loading ? (
                    <div className="loading">
                        <div className="cosmic-loader">
                            <div className="moon"></div>
                            <div className="orbit"></div>
                        </div>
                        <p>Загрузка пользователей...</p>
                    </div>
                ) : (
                    <>
                        <div className="users-grid">
                            {sortedUsers.length > 0 ? (
                                sortedUsers.map((user, index) => (
                                    <div 
                                        key={index} 
                                        className={`user-card glow-on-hover ${selectedUser === index ? 'selected' : ''}`}
                                        style={{ '--aura-color': getAuraColor(index) }}
                                        onClick={() => setSelectedUser(selectedUser === index ? null : index)}
                                    >
                                        <div className="card-glow"></div>
                                        <div className="user-rank">
                                            {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
                                        <div className="user-avatar">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} />
                                            ) : (
                                                <div className="avatar-placeholder" style={{ background: getAuraColor(index) }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="avatar-aura"></div>
                                        </div>
                                        <div className="user-info">
                                            <h3 className="user-name">{user.name}</h3>
                                            <div className="user-stats">
                                                <div className="stat">
                                                    <span className="stat-icon">💰</span>
                                                    <span className="stat-value" style={{ color: getBalanceColor(user.balance) }}>
                                                        {user.balance || 0}
                                                    </span>
                                                </div>
                                                <div className="stat">
                                                    <span className="stat-icon">🎁</span>
                                                    <span className="stat-value">
                                                        {user.activedPromoCodes?.length || 0}
                                                    </span>
                                                </div>
                                                <div className="stat">
                                                    <span className="stat-icon">⚡</span>
                                                    <span className="stat-value">
                                                        {Math.floor((user.balance || 0) / 100)} lvl
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="user-date">
                                                <span>📅</span> {formatDate(user.createdAt)}
                                            </div>
                                        </div>
                                        <div className="card-energy">
                                            <div className="energy-bar" style={{ width: `${Math.min(100, (user.balance || 0) / 20)}%` }}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <div className="no-results-icon">🔮</div>
                                    <p>Пользователи не найдены в галактике</p>
                                </div>
                            )}
                        </div>

                        {/* Топ пользователей */}
                        {users.length > 0 && (
                            <div className="top-users">
                                <div className="top-header">
                                    <h3>🏆 Легендарные игроки</h3>
                                    <div className="top-decoration"></div>
                                </div>
                                <div className="top-list">
                                    {[...users]
                                        .sort((a, b) => (b.balance || 0) - (a.balance || 0))
                                        .slice(0, 5)
                                        .map((user, index) => (
                                            <div key={index} className="top-item glow-on-hover">
                                                <div className="top-rank">
                                                    {index === 0 && '🌟'}
                                                    {index === 1 && '⭐'}
                                                    {index === 2 && '✨'}
                                                    {(index > 2) && `${index + 1}`}
                                                </div>
                                                <div className="top-avatar">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.name} />
                                                    ) : (
                                                        <div className="top-avatar-placeholder">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="top-name">{user.name}</div>
                                                <div className="top-balance">
                                                    <span className="balance-icon">💰</span>
                                                    <span>{user.balance || 0}</span>
                                                </div>
                                                <div className="top-power">
                                                    <div className="power-bar" style={{ width: `${Math.min(100, (user.balance || 0) / 10)}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}