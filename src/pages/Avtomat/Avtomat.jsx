import './AvtomatStyle.scss'
import { useState, useEffect } from 'react'
import axios from 'axios'

export const Avtomat = () => {
    const [balance, setBalance] = useState(0)
    const [result, setResult] = useState(null)
    const [isSpinning, setIsSpinning] = useState(false)
    const [userId, setUserId] = useState(null)
    const [userData, setUserData] = useState(null)
    const [betAmount, setBetAmount] = useState(50)
    const [multiplier, setMultiplier] = useState(1)
    const [customBet, setCustomBet] = useState('50')

    // Доступные множители
    const multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    // Быстрые ставки
    const quickBets = [10, 25, 50, 100, 250, 500, 1000]

    // Символы с шансами выпадения (%)
    const symbols = [
        { symbol: '💎', chance: 2, win: 1000 },
        { symbol: '7️⃣', chance: 4, win: 500 },
        { symbol: '⭐', chance: 6, win: 200 },
        { symbol: '🔔', chance: 8, win: 100 },
        { symbol: '🍇', chance: 10, win: 50 },
        { symbol: '🍋', chance: 12, win: 30 },
        { symbol: '🍊', chance: 14, win: 20 },
        { symbol: '🍒', chance: 16, win: 10 },
        { symbol: '💣', chance: 12, win: -50 },
        { symbol: '🧨', chance: 10, win: -100 },
        { symbol: '🔥', chance: 6, win: -200 }
    ]

    const getRandomSymbol = () => {
        const random = Math.random() * 100
        let cumulative = 0
        
        for (const item of symbols) {
            cumulative += item.chance
            if (random <= cumulative) {
                return { ...item, win: item.win * multiplier }
            }
        }
        return { ...symbols[0], win: symbols[0].win * multiplier }
    }

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

    const handleBetChange = (value) => {
        let numValue = parseInt(value)
        if (isNaN(numValue)) numValue = 0
        if (numValue < 1) numValue = 1
        if (numValue > 10000) numValue = 10000
        setBetAmount(numValue)
        setCustomBet(numValue.toString())
    }

    const handleQuickBet = (amount) => {
        setBetAmount(amount)
        setCustomBet(amount.toString())
    }

    const spin = async () => {
        if (isSpinning) return
        if (balance < betAmount) {
            alert(`❌ Недостаточно средств! Нужно ${betAmount} монет`)
            return
        }

        setIsSpinning(true)
        setResult(null)

        const totalBet = betAmount * multiplier
        const newBalanceAfterBet = balance - totalBet
        await updateBalanceOnServer(newBalanceAfterBet)

        let spins = 0
        const maxSpins = 20
        const interval = setInterval(() => {
            const randomSymbol = getRandomSymbol()
            setResult({ symbol: randomSymbol.symbol, win: 0 })
            spins++
            if (spins >= maxSpins) {
                clearInterval(interval)
                finalizeSpin()
            }
        }, 50)

        const finalizeSpin = async () => {
            const finalItem = getRandomSymbol()
            const winAmount = finalItem.win
            
            setResult({ symbol: finalItem.symbol, win: winAmount })
            
            if (winAmount !== 0) {
                const finalBalance = newBalanceAfterBet + winAmount
                await updateBalanceOnServer(finalBalance)
            }
            
            setIsSpinning(false)
        }
    }

    const totalBet = betAmount * multiplier

    return (
        <div className="case-page">
            <div className="case-container">
                <div className="bet-section" style={{ marginTop: 20 }}>
                    <div className="section-label">💰 СТАВКА</div>
                    <div className="bet-input-wrapper">
                        <input 
                            type="number" 
                            className="bet-input"
                            value={customBet}
                            onChange={(e) => handleBetChange(e.target.value)}
                            min="1"
                            max="10000"
                            step="1"
                        />
                    </div>
                    <div className="quick-bets">
                        {quickBets.map(amount => (
                            <button
                                key={amount}
                                className={`quick-bet-btn ${betAmount === amount ? 'active' : ''}`}
                                onClick={() => handleQuickBet(amount)}
                            >
                                {amount}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Выбор множителя */}
                <div className="multiplier-section">
                    <div className="section-label">⚡ МНОЖИТЕЛЬ x{multiplier}</div>
                    <div className="multiplier-grid">
                        {multipliers.map(m => (
                            <button
                                key={m}
                                className={`multiplier-btn ${multiplier === m ? 'active' : ''}`}
                                onClick={() => setMultiplier(m)}
                            >
                                x{m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Общая ставка */}
                <div className="total-bet">
                    <span>📊 ОБЩАЯ СТАВКА:</span>
                    <span className="total-amount">{totalBet} ₽</span>
                </div>

                {/* Предупреждение о максимальной ставке */}
                {totalBet > balance && (
                    <div className="warning-message">
                        ⚠️ Недостаточно средств! Нужно {totalBet} монет
                    </div>
                )}

                {/* Игровой автомат */}
                <div className="slot-machine">
                    <div className="slot-window">
                        {result ? (
                            <div className={`slot-symbol ${!isSpinning && result.win > 0 ? 'winner' : ''} ${!isSpinning && result.win < 0 ? 'bomb' : ''}`}>
                                {result.symbol}
                            </div>
                        ) : (
                            <div className="slot-symbol">🎰</div>
                        )}
                    </div>
                    
                    {result && !isSpinning && (
                        <div className={`result ${result.win > 0 ? 'win' : result.win < 0 ? 'bomb-result' : 'lose'}`}>
                            {result.win > 0 ? (
                                <div className="win-message">
                                    🎉 ВЫИГРЫШ! +{result.win} монет 🎉
                                </div>
                            ) : result.win < 0 ? (
                                <div className="bomb-message">
                                    💣 БОМБА! -{Math.abs(result.win)} монет 💣
                                </div>
                            ) : (
                                <div className="lose-message">
                                    😔 Не повезло 😔
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button 
                    className="spin-btn" 
                    onClick={spin}
                    disabled={isSpinning || balance < totalBet}
                >
                    {isSpinning ? '🌀 КРУЧУ...' : `🎰 КРУТИТЬ (${totalBet} монет)`}
                </button>

                {/* Таблица выигрышей */}
                <div className="wins-table">
                    <h3>📋 Таблица выигрышей (x{multiplier})</h3>
                    <div className="wins-grid">
                        {symbols.map((item, index) => (
                            <div key={index} className={`win-item ${item.win < 0 ? 'bomb-item' : ''}`}>
                                <span className="win-symbol">{item.symbol}</span>
                                <div className="win-info">
                                    <span className={`win-amount ${item.win < 0 ? 'bomb-amount' : ''}`}>
                                        {item.win * multiplier > 0 ? `+${item.win * multiplier}` : item.win * multiplier}
                                    </span>
                                    <span className="win-chance">{item.chance}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="info-text">
                        <p>🎲 Шансы рассчитаны на 100%</p>
                        <p>💡 Чем выше множитель, тем больше риск и награда!</p>
                        <p>⚡ Множитель увеличивает ВСЕ выигрыши и проигрыши!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}