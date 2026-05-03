import './HomeStyle.scss'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export const Home = () => {
    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(0)
    const [lastResults, setLastResults] = useState([])
    const [topUsers, setTopUsers] = useState([])

    useEffect(() => {
        const userIndex = localStorage.getItem('userIndex')
        if (userIndex) {
            fetchUserData(userIndex)
        }
        fetchTopUsers()
        generateLastResults()
    }, [])

    const fetchUserData = async (userIndex) => {
        try {
            const response = await axios.get(`https://six7keybackendnodejs.onrender.com/user/${userIndex}`)
            if (response.data && !response.data.message) {
                setUser(response.data)
                setBalance(response.data.balance || 0)
            }
        } catch (error) {
            console.error('Ошибка получения данных:', error)
        }
    }

    const fetchTopUsers = async () => {
        try {
            const response = await axios.get('https://six7keybackendnodejs.onrender.com/users')
            if (response.data) {
                const top = [...response.data]
                    .sort((a, b) => (b.balance || 0) - (a.balance || 0))
                    .slice(0, 5)
                setTopUsers(top)
            }
        } catch (error) {
            console.error('Ошибка получения топ пользователей:', error)
        }
    }

    const generateLastResults = () => {
        const symbols = ['💎', '7️⃣', '⭐', '🔔', '🍇', '💣', '🧨', '🔥']
        const results = []
        for (let i = 0; i < 10; i++) {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
            const isWin = !['💣', '🧨', '🔥'].includes(randomSymbol)
            results.push({ symbol: randomSymbol, isWin })
        }
        setLastResults(results)
    }

    return (
        <div className="main-page">
            {/* Фоновые ауры */}
            <div className="auras">
                <div className="aura aura-1"></div>
                <div className="aura aura-2"></div>
                <div className="aura aura-3"></div>
            </div>

            <div className="main-container">
                {/* Приветственный баннер */}
                <div className="welcome-banner">
                    <div className="banner-content">
                        <h1>✨ Добро пожаловать в 67KEY CASINO ✨</h1>
                        <p>Крупнейшая платформа для открытия кейсов и выигрышей</p>
                        {!user && (
                            <div className="banner-buttons">
                                <Link to="/register" className="banner-btn register">Регистрация</Link>
                                <Link to="/login" className="banner-btn login">Войти</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Статистика пользователя */}
                {user && (
                    <div className="user-stats-card">
                        <div className="stats-header">
                            <div className="user-avatar">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-greeting">
                                <h3>Привет, {user.name}!</h3>
                                <p>Рады снова видеть тебя</p>
                            </div>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-icon">💰</span>
                                <div className="stat-info">
                                    <span className="stat-value">{balance}</span>
                                    <span className="stat-label">монет</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <span className="stat-icon">🎁</span>
                                <div className="stat-info">
                                    <span className="stat-value">{user.activedPromoCodes?.length || 0}</span>
                                    <span className="stat-label">промокодов</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <span className="stat-icon">📅</span>
                                <div className="stat-info">
                                    <span className="stat-value">{user.createdAt?.split(',')[0] || 'Новый'}</span>
                                    <span className="stat-label">дата регистрации</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Быстрый доступ */}
                <div className="quick-access">
                    <h2>🚀 Быстрый старт</h2>
                    <div className="access-grid">
                        <Link to="/avtomat" className="access-card">
                            <div className="card-icon">🎰</div>
                            <h3>Автомат</h3>
                            <p>Крути слот и выигрывай до x1000!</p>
                            <span className="card-btn">Играть →</span>
                        </Link>
                        <Link to="/cases" className="access-card">
                            <div className="card-icon">🎲</div>
                            <h3>Кейсы</h3>
                            <p>Открывай кейсы с редкими предметами</p>
                            <span className="card-btn">Открыть →</span>
                        </Link>
                        <Link to="/minesweeper" className="access-card">
                            <div className="card-icon">💣</div>
                            <h3>Сапёр</h3>
                            <p>Испытай удачу в классической игре</p>
                            <span className="card-btn">Играть →</span>
                        </Link>
                        <Link to="/clicker" className="access-card">
                            <div className="card-icon">🖱️</div>
                            <h3>Кликер</h3>
                            <p>Зарабатывай монеты кликами</p>
                            <span className="card-btn">Играть →</span>
                        </Link>
                        <Link to="/promo-code" className="access-card">
                            <div className="card-icon">🎁</div>
                            <h3>Промокоды</h3>
                            <p>Активируй промокоды и получай бонусы</p>
                            <span className="card-btn">Активировать →</span>
                        </Link>
                        <Link to="/transfer" className="access-card">
                            <div className="card-icon">💸</div>
                            <h3>Перевод</h3>
                            <p>Переводи монеты другим игрокам</p>
                            <span className="card-btn">Перевести →</span>
                        </Link>
                    </div>
                </div>

                {/* Топ игроков и информация */}
                <div className="info-section">
                    <div className="top-players">
                        <h3>🏆 Топ игроков</h3>
                        <div className="top-list">
                            {topUsers.map((player, index) => (
                                <div key={index} className="top-player">
                                    <div className="top-rank">
                                        {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                    </div>
                                    <div className="top-name">{player.name}</div>
                                    <div className="top-balance">💰 {player.balance || 0}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="info-cards">
                        <div className="info-card">
                            <div className="info-icon">🎯</div>
                            <h4>Как играть?</h4>
                            <p>Выбери ставку, нажми на кнопку и жди результат! Чем выше ставка - тем больше выигрыш!</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">💡</div>
                            <h4>Советы</h4>
                            <p>Используй промокоды для получения бонусов. Следи за акциями в Telegram!</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">⚡</div>
                            <h4>Моментальные выплаты</h4>
                            <p>Все выигрыши зачисляются на баланс мгновенно. Выводи в любой момент!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}