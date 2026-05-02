import './ClickerStyle.scss'
import { useState, useEffect } from 'react'
import axios from 'axios'

export const Clicker = () => {
    const [clicks, setClicks] = useState(0)
    const [balance, setBalance] = useState(0)
    const [clickPower, setClickPower] = useState(1)
    const [autoClickers, setAutoClickers] = useState(0)
    const [userId, setUserId] = useState(null)
    const [userData, setUserData] = useState(null)
    const [message, setMessage] = useState('')
    const [energy, setEnergy] = useState(100)
    const [level, setLevel] = useState(1)

    // Цены на улучшения
    const upgrades = [
        { name: '💪 Сила клика', price: 50, power: 1, description: '+1 монета за клик' },
        { name: '🤖 Автокликер', price: 200, power: 0, description: 'Кликает автоматически каждую секунду' },
        { name: '⚡ Энергия', price: 100, power: 0, description: 'Восстанавливает энергию' }
    ]

    useEffect(() => {
        const userIndex = localStorage.getItem('userIndex')
        if (userIndex) {
            setUserId(userIndex)
            fetchUserData(userIndex)
            loadClickerData()
        }
    }, [])

    useEffect(() => {
        // Автокликер
        const interval = setInterval(() => {
            if (autoClickers > 0 && energy > 0) {
                addClicks(autoClickers)
            }
        }, 1000)

        // Восстановление энергии
        const energyInterval = setInterval(() => {
            setEnergy(prev => Math.min(100, prev + 1))
        }, 3000)

        return () => {
            clearInterval(interval)
            clearInterval(energyInterval)
        }
    }, [autoClickers, energy])

    const fetchUserData = async (userIndex) => {
        try {
            const response = await axios.get(`https://six7keybackendnodejs.onrender.com/user/${userIndex}`)
            if (response.data && !response.data.message) {
                setUserData(response.data)
                setBalance(response.data.balance || 0)
            }
        } catch (error) {
            console.error('Ошибка получения данных:', error)
        }
    }

    const loadClickerData = () => {
        const savedClicks = localStorage.getItem('clicker_clicks')
        const savedPower = localStorage.getItem('clicker_power')
        const savedAutoClickers = localStorage.getItem('clicker_autoclickers')
        
        if (savedClicks) setClicks(parseInt(savedClicks))
        if (savedPower) setClickPower(parseInt(savedPower))
        if (savedAutoClickers) setAutoClickers(parseInt(savedAutoClickers))
    }

    const saveClickerData = () => {
        localStorage.setItem('clicker_clicks', clicks.toString())
        localStorage.setItem('clicker_power', clickPower.toString())
        localStorage.setItem('clicker_autoclickers', autoClickers.toString())
    }

    const addClicks = (amount) => {
        if (energy <= 0) return
        setClicks(prev => prev + amount)
        setEnergy(prev => Math.max(0, prev - 1))
        saveClickerData()
        
        // Проверка повышения уровня
        const nextLevel = Math.floor(100 * Math.pow(1.5, level - 1))
        if (clicks + amount >= nextLevel) {
            setLevel(prev => prev + 1)
        }
    }

    const handleClick = () => {
        if (energy <= 0) {
            setMessage('❌ Нет энергии! Подождите немного')
            setTimeout(() => setMessage(''), 2000)
            return
        }
        addClicks(clickPower)
        
        // Анимация частиц
        const clicker = document.querySelector('.clicker-circle')
        if (clicker) {
            clicker.style.transform = 'scale(0.95)'
            setTimeout(() => {
                clicker.style.transform = 'scale(1)'
            }, 100)
        }
    }

    const buyUpgrade = (index) => {
        const upgrade = upgrades[index]
        
        if (clicks < upgrade.price) {
            setMessage(`❌ Не хватает кликов! Нужно ${upgrade.price}`)
            setTimeout(() => setMessage(''), 2000)
            return
        }

        setClicks(prev => prev - upgrade.price)

        if (index === 0) {
            setClickPower(prev => prev + upgrade.power)
            setMessage(`✅ Куплено! Сила клика +${upgrade.power}`)
        } else if (index === 1) {
            setAutoClickers(prev => prev + 1)
            setMessage(`✅ Куплен автокликер! +1 клик в секунду`)
        } else if (index === 2) {
            setEnergy(100)
            setMessage(`✅ Энергия восстановлена!`)
        }

        saveClickerData()
        setTimeout(() => setMessage(''), 2000)
    }

    const convertToBalance = async () => {
        if (clicks < 100) {
            setMessage('❌ Нужно минимум 100 кликов для обмена')
            setTimeout(() => setMessage(''), 2000)
            return
        }

        const exchangeRate = 10 // 10 кликов = 1 монета
        const earned = Math.floor(clicks / exchangeRate)
        
        if (!userId) {
            setMessage('❌ Авторизуйтесь, чтобы обменять клики')
            return
        }

        try {
            const newBalance = balance + earned
            await axios.put(`https://six7keybackendnodejs.onrender.com/user/edit/${userId}`, {
                avatarUrl: userData?.avatarUrl || '',
                name: userData?.name || '',
                password: userData?.password || '',
                balance: newBalance
            })
            
            setBalance(newBalance)
            setClicks(prev => prev - (earned * exchangeRate))
            setMessage(`✅ Обменяно ${earned} монет!`)
            saveClickerData()
            
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('Ошибка обмена:', error)
            setMessage('❌ Ошибка при обмене')
        }
    }

    const nextLevel = Math.floor(100 * Math.pow(1.5, level - 1))
    const progress = Math.min(100, (clicks / nextLevel) * 100)

    return (
        <div className="clicker-page">
            <div className="clicker-container">
                {/* Заголовок */}
                <div className="clicker-header">
                    <h1>🖱️ КЛИКЕР</h1>
                    <p>Кликай, прокачивайся и зарабатывай монеты!</p>
                </div>

                {/* Статистика */}
                <div className="stats">
                    <div className="stat-card">
                        <span className="stat-icon">🖱️</span>
                        <div className="stat-info">
                            <span className="stat-value">{clicks.toLocaleString()}</span>
                            <span className="stat-label">кликов</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">💰</span>
                        <div className="stat-info">
                            <span className="stat-value">{balance}</span>
                            <span className="stat-label">монет</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">💪</span>
                        <div className="stat-info">
                            <span className="stat-value">{clickPower}</span>
                            <span className="stat-label">сила клика</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🤖</span>
                        <div className="stat-info">
                            <span className="stat-value">{autoClickers}</span>
                            <span className="stat-label">автокликеры</span>
                        </div>
                    </div>
                </div>

                {/* Энергия */}
                <div className="energy-bar">
                    <div className="energy-label">
                        <span>⚡ Энергия</span>
                        <span>{energy}/100</span>
                    </div>
                    <div className="energy-progress">
                        <div className="energy-fill" style={{ width: `${energy}%` }}></div>
                    </div>
                </div>

                {/* Уровень */}
                <div className="level-section">
                    <div className="level-info">
                        <span>🌟 Уровень {level}</span>
                        <span>{clicks.toLocaleString()} / {nextLevel.toLocaleString()}</span>
                    </div>
                    <div className="level-progress">
                        <div className="level-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Кликер */}
                <div className="clicker-area">
                    <div className="clicker-circle" onClick={handleClick}>
                        <span style={{ userSelect: 'none' }}>🖱️</span>
                        <div className="clicker-ripple"></div>
                    </div>
                    <p className="click-hint">Кликни сюда!</p>
                </div>

                {/* Магазин улучшений */}
                <div className="shop">
                    <h2>📦 Магазин улучшений</h2>
                    <div className="upgrades-grid">
                        <div className="upgrade-card">
                            <div className="upgrade-icon">💪</div>
                            <h3>Сила клика</h3>
                            <p>+{upgrades[0].power} монета за клик</p>
                            <div className="upgrade-price">💰 {upgrades[0].price} кликов</div>
                            <button onClick={() => buyUpgrade(0)} disabled={clicks < upgrades[0].price}>
                                Купить
                            </button>
                        </div>
                        <div className="upgrade-card">
                            <div className="upgrade-icon">🤖</div>
                            <h3>Автокликер</h3>
                            <p>+1 клик в секунду</p>
                            <div className="upgrade-price">💰 {upgrades[1].price} кликов</div>
                            <button onClick={() => buyUpgrade(1)} disabled={clicks < upgrades[1].price}>
                                Купить
                            </button>
                        </div>
                        <div className="upgrade-card">
                            <div className="upgrade-icon">⚡</div>
                            <h3>Восстановить энергию</h3>
                            <p>Полное восстановление</p>
                            <div className="upgrade-price">💰 {upgrades[2].price} кликов</div>
                            <button onClick={() => buyUpgrade(2)} disabled={clicks < upgrades[2].price}>
                                Восстановить
                            </button>
                        </div>
                    </div>
                </div>

                {/* Обмен на монеты */}
                <div className="exchange">
                    <div className="exchange-info">
                        <span>💱 Курс обмена: 10 кликов = 1 монета</span>
                    </div>
                    <button className="exchange-btn" onClick={convertToBalance}>
                        💰 Обменять клики на монеты
                    </button>
                </div>

                {/* Сообщение */}
                {message && (
                    <div className="message">
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}

// Экспорт по умолчанию (на всякий случай)
export default Clicker