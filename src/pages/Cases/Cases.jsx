import './CasesStyle.scss'
import { useState, useEffect } from 'react'
import axios from 'axios'

export const Cases = () => {
    const [balance, setBalance] = useState(0)
    const [userId, setUserId] = useState(null)
    const [userData, setUserData] = useState(null)
    const [selectedCase, setSelectedCase] = useState(null)
    const [isOpening, setIsOpening] = useState(false)
    const [result, setResult] = useState(null)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [animationActive, setAnimationActive] = useState(false)

    // Список кейсов
    const cases = [
        {
            id: 1,
            name: '⭐ Обычный кейс',
            icon: '📦',
            price: 100,
            color: '#4caf50',
            items: [
                { name: '🍒 Вишня', chance: 30, win: 10, rarity: 'common' },
                { name: '🍊 Апельсин', chance: 25, win: 20, rarity: 'common' },
                { name: '🍋 Лимон', chance: 20, win: 30, rarity: 'common' },
                { name: '🍇 Виноград', chance: 15, win: 50, rarity: 'rare' },
                { name: '🔔 Колокольчик', chance: 6, win: 100, rarity: 'epic' },
                { name: '⭐ Звезда', chance: 3, win: 200, rarity: 'epic' },
                { name: '💎 Алмаз', chance: 1, win: 500, rarity: 'legendary' }
            ]
        },
        {
            id: 2,
            name: '🔥 Золотой кейс',
            icon: '🎁',
            price: 2500,
            color: '#ff9800',
            items: [
                { name: '🍇 Виноград', chance: 25, win: 50, rarity: 'common' },
                { name: '🔔 Колокольчик', chance: 20, win: 100, rarity: 'rare' },
                { name: '⭐ Звезда', chance: 15, win: 200, rarity: 'rare' },
                { name: '💎 Алмаз', chance: 12, win: 500, rarity: 'epic' },
                { name: '👑 Корона', chance: 10, win: 1000, rarity: 'legendary' },
                { name: '🌈 Радуга', chance: 8, win: 2000, rarity: 'legendary' },
                { name: '🚀 Космос', chance: 5, win: 5000, rarity: 'ultra' },
                { name: '🌌 Галактика', chance: 3, win: 10000, rarity: 'ultra' },
                { name: '💫 Звездопад', chance: 2, win: 25000, rarity: 'ultra' }
            ]
        },
        {
            id: 3,
            name: '💎 Легендарный кейс',
            icon: '💎',
            price: 5000,
            color: '#9c27b0',
            items: [
                { name: '⭐ Звезда', chance: 20, win: 200, rarity: 'common' },
                { name: '💎 Алмаз', chance: 18, win: 500, rarity: 'rare' },
                { name: '👑 Корона', chance: 15, win: 1000, rarity: 'rare' },
                { name: '🌈 Радуга', chance: 12, win: 2000, rarity: 'epic' },
                { name: '🚀 Космос', chance: 10, win: 5000, rarity: 'legendary' },
                { name: '⚡ Молния', chance: 8, win: 10000, rarity: 'legendary' },
                { name: '🔥 Феникс', chance: 6, win: 25000, rarity: 'ultra' },
                { name: '🌌 Галактика', chance: 5, win: 50000, rarity: 'ultra' },
                { name: '💫 Звездопад', chance: 4, win: 100000, rarity: 'ultra' },
                { name: '🪐 Сатурн', chance: 2, win: 250000, rarity: 'ultra' }
            ]
        },
        {
            id: 4,
            name: '👑 Премиум кейс',
            icon: '👑',
            price: 10000,
            color: '#ff3366',
            items: [
                { name: '💎 Алмаз', chance: 20, win: 500, rarity: 'common' },
                { name: '👑 Корона', chance: 18, win: 1000, rarity: 'rare' },
                { name: '🌈 Радуга', chance: 15, win: 2500, rarity: 'epic' },
                { name: '🚀 Космос', chance: 12, win: 5000, rarity: 'legendary' },
                { name: '⚡ Молния', chance: 10, win: 10000, rarity: 'legendary' },
                { name: '🔥 Феникс', chance: 8, win: 25000, rarity: 'ultra' },
                { name: '🌌 Галактика', chance: 7, win: 50000, rarity: 'ultra' },
                { name: '💫 Звездопад', chance: 5, win: 100000, rarity: 'ultra' },
                { name: '🪐 Сатурн', chance: 3, win: 250000, rarity: 'ultra' },
                { name: '🌟 Супернова', chance: 2, win: 500000, rarity: 'ultra' }
            ]
        }
    ]

    useEffect(() => {
        const userIndex = localStorage.getItem('userIndex')
        if (userIndex) {
            setUserId(userIndex)
            fetchUserData(userIndex)
        }
    }, [])

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

    const updateBalanceOnServer = async (newBalance) => {
        if (!userId || !userData) return
        
        try {
            const response = await axios.put(`https://six7keybackendnodejs.onrender.com/user/edit/${userId}`, {
                avatarUrl: userData.avatarUrl,
                name: userData.name,
                password: userData.password,
                balance: newBalance
            })
            
            if (response.data) {
                setBalance(newBalance)
                setUserData({ ...userData, balance: newBalance })
            }
        } catch (error) {
            console.error('Ошибка обновления баланса:', error)
            fetchUserData(userId)
        }
    }

    const openCase = async (caseItem) => {
        if (isOpening) return
        
        if (balance < caseItem.price) {
            setMessage(`❌ Недостаточно средств! Нужно ${caseItem.price} монет`)
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        setIsOpening(true)
        setSelectedCase(caseItem)
        setResult(null)
        setAnimationActive(true)

        const newBalance = balance - caseItem.price
        await updateBalanceOnServer(newBalance)

        let rolls = 0
        const maxRolls = 20
        const rollInterval = setInterval(() => {
            const randomItem = getRandomItem(caseItem.items)
            setResult(randomItem)
            rolls++
            if (rolls >= maxRolls) {
                clearInterval(rollInterval)
                finalizeOpen(caseItem)
            }
        }, 50)
    }

    const getRandomItem = (items) => {
        const random = Math.random() * 100
        let cumulative = 0
        
        for (const item of items) {
            cumulative += item.chance
            if (random <= cumulative) {
                return item
            }
        }
        return items[0]
    }

    const finalizeOpen = async (caseItem) => {
        const finalItem = getRandomItem(caseItem.items)
        setResult(finalItem)
        
        const newBalance = balance + finalItem.win
        await updateBalanceOnServer(newBalance)
        
        setMessage(`🎉 Вы выиграли ${finalItem.name} +${finalItem.win} монет! 🎉`)
        setMessageType('success')
        
        setTimeout(() => {
            setAnimationActive(false)
            setIsOpening(false)
            setMessage('')
        }, 3000)
    }

    const getRarityColor = (rarity) => {
        switch(rarity) {
            case 'common': return '#4caf50'
            case 'rare': return '#2196f3'
            case 'epic': return '#9c27b0'
            case 'legendary': return '#ff9800'
            case 'ultra': return 'linear-gradient(135deg, #00d2ff, #3a7bd5, #00d2ff)'
            default: return '#fff'
        }
    }

    const getRarityName = (rarity) => {
        switch(rarity) {
            case 'common': return 'Обычный'
            case 'rare': return 'Редкий'
            case 'epic': return 'Эпический'
            case 'legendary': return 'Легендарный'
            case 'ultra': return 'УЛЬТРА'
            default: return ''
        }
    }

    const getRarityGradient = (rarity) => {
        if (rarity === 'ultra') {
            return 'linear-gradient(135deg, #00d2ff, #3a7bd5, #00d2ff, #3a7bd5)'
        }
        return 'none'
    }

    return (
        <div className="cases-page">
            <div className="auras">
                <div className="aura aura-1"></div>
                <div className="aura aura-2"></div>
                <div className="aura aura-3"></div>
                <div className="aura aura-4"></div>
            </div>

            <div className="cases-container">
                <div className="cases-header">
                    <div className="glow-text">
                        <h1>🎲 КЕЙСЫ</h1>
                        <p>Открывай кейсы и получай ценные призы!</p>
                    </div>
                </div>

                <div className="balance-card">
                    <div className="balance-glow"></div>
                    <span className="balance-icon">💰</span>
                    <span className="balance-value">{balance}</span>
                    <span className="balance-label">монет</span>
                </div>

                {result && animationActive && (
                    <div className={`result-popup glass-card rarity-${result.rarity}`}>
                        <div className="result-content">
                            <div className="result-icon">{result.name}</div>
                            <h3>ВЫ ВЫИГРАЛИ!</h3>
                            <div className="result-item">{result.name}</div>
                            <div className="result-win">+{result.win} монет</div>
                            <div className="result-rarity" style={{ 
                                background: getRarityGradient(result.rarity),
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: result.rarity === 'ultra' ? 'transparent' : getRarityColor(result.rarity)
                            }}>
                                {getRarityName(result.rarity)}
                            </div>
                            {result.rarity === 'ultra' && (
                                <div className="ultra-aura"></div>
                            )}
                        </div>
                    </div>
                )}

                <div className="cases-grid">
                    {cases.map(caseItem => (
                        <div key={caseItem.id} className="case-card glass-card">
                            <div className="case-glow" style={{ background: `radial-gradient(circle, ${caseItem.color}40, transparent)` }}></div>
                            <div className="case-icon">{caseItem.icon}</div>
                            <h3>{caseItem.name}</h3>
                            <div className="case-price" style={{ color: caseItem.color }}>
                                💰 {caseItem.price} монет
                            </div>
                            <div className="case-items">
                                {caseItem.items.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="case-item-tag" style={{ 
                                        background: item.rarity === 'ultra' ? 'linear-gradient(135deg, #00d2ff, #3a7bd5)' : getRarityColor(item.rarity),
                                        boxShadow: item.rarity === 'ultra' ? '0 0 10px rgba(0,210,255,0.8)' : 'none'
                                    }}>
                                        {item.name}
                                    </div>
                                ))}
                                {caseItem.items.length > 5 && (
                                    <div className="case-item-tag more">+{caseItem.items.length - 5}</div>
                                )}
                            </div>
                            <button 
                                className="open-btn"
                                onClick={() => openCase(caseItem)}
                                disabled={isOpening || balance < caseItem.price}
                                style={{ background: `linear-gradient(135deg, ${caseItem.color}, ${caseItem.color}dd)` }}
                            >
                                {isOpening && selectedCase?.id === caseItem.id ? '🎲 ОТКРЫТИЕ...' : '🎁 ОТКРЫТЬ'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="items-table glass-card">
                    <div className="table-header">
                        <span className="table-icon">📋</span>
                        <h3>Таблица предметов</h3>
                    </div>
                    <div className="items-grid">
                        <div className="rarity-section">
                            <h4 style={{ color: '#4caf50' }}>🟢 Обычные</h4>
                            <div className="rarity-items">
                                <span>🍒 Вишня</span>
                                <span>🍊 Апельсин</span>
                                <span>🍋 Лимон</span>
                                <span>🍇 Виноград</span>
                                <span>⭐ Звезда</span>
                            </div>
                        </div>
                        <div className="rarity-section">
                            <h4 style={{ color: '#2196f3' }}>🔵 Редкие</h4>
                            <div className="rarity-items">
                                <span>🔔 Колокольчик</span>
                                <span>💎 Алмаз</span>
                                <span>👑 Корона</span>
                            </div>
                        </div>
                        <div className="rarity-section">
                            <h4 style={{ color: '#9c27b0' }}>🟣 Эпические</h4>
                            <div className="rarity-items">
                                <span>🌈 Радуга</span>
                                <span>🚀 Космос</span>
                                <span>⭐ Звезда</span>
                            </div>
                        </div>
                        <div className="rarity-section">
                            <h4 style={{ color: '#ff9800' }}>🟠 Легендарные</h4>
                            <div className="rarity-items">
                                <span>⚡ Молния</span>
                                <span>🔥 Феникс</span>
                                <span>🌈 Радуга</span>
                            </div>
                        </div>
                        <div className="rarity-section ultra-section">
                            <h4 style={{ background: 'linear-gradient(135deg, #00d2ff, #3a7bd5)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                                🌌 УЛЬТРА
                            </h4>
                            <div className="rarity-items">
                                <span className="ultra-item">🌌 Галактика</span>
                                <span className="ultra-item">💫 Звездопад</span>
                                <span className="ultra-item">🪐 Сатурн</span>
                                <span className="ultra-item">🌟 Супернова</span>
                            </div>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`message ${messageType}`}>
                        <span>{messageType === 'success' ? '🎉' : '💀'}</span>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}