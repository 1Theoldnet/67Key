import './MinesweeperStyle.scss'
import { useState, useEffect } from 'react'
import axios from 'axios'

export const Minesweeper = () => {
    const [balance, setBalance] = useState(0)
    const [userId, setUserId] = useState(null)
    const [userData, setUserData] = useState(null)
    const [board, setBoard] = useState([])
    const [gameActive, setGameActive] = useState(false)
    const [betAmount, setBetAmount] = useState(50)
    const [customBet, setCustomBet] = useState('50')
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [mineCount, setMineCount] = useState(5)
    const [revealedCells, setRevealedCells] = useState([])
    const [currentWin, setCurrentWin] = useState(0)
    const [gameResult, setGameResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [hoveredCell, setHoveredCell] = useState(null)

    const BOARD_SIZE = 5
    const TOTAL_CELLS = 25

    const multipliers = {
        1: 1.2, 2: 1.5, 3: 2, 4: 2.5, 5: 3,
        6: 4, 7: 5, 8: 7, 9: 10, 10: 15,
        11: 20, 12: 30, 13: 50, 14: 75, 15: 100,
        16: 150, 17: 200, 18: 300, 19: 500, 20: 750,
        21: 1000, 22: 1500, 23: 2000, 24: 5000
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

    const initGame = () => {
        const newBoard = Array(BOARD_SIZE).fill().map(() => 
            Array(BOARD_SIZE).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                neighborMines: 0
            }))
        )
        
        let minesPlaced = 0
        while (minesPlaced < mineCount) {
            const row = Math.floor(Math.random() * BOARD_SIZE)
            const col = Math.floor(Math.random() * BOARD_SIZE)
            if (!newBoard[row][col].isMine) {
                newBoard[row][col].isMine = true
                minesPlaced++
            }
        }
        
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (!newBoard[i][j].isMine) {
                    let count = 0
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const ni = i + di, nj = j + dj
                            if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && newBoard[ni][nj].isMine) {
                                count++
                            }
                        }
                    }
                    newBoard[i][j].neighborMines = count
                }
            }
        }
        
        setBoard(newBoard)
        setRevealedCells([])
        setGameActive(true)
        setGameResult(null)
        setCurrentWin(0)
    }

    const startNewGame = async () => {
        if (!userId) {
            setMessage('❌ Авторизуйтесь, чтобы играть!')
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        const bet = parseInt(customBet)
        if (isNaN(bet) || bet < 10) {
            setMessage('❌ Минимальная ставка 10 монет!')
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        if (bet > balance) {
            setMessage(`❌ Недостаточно средств! Ваш баланс: ${balance} монет`)
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        setLoading(true)
        
        const newBalance = balance - bet
        await updateBalanceOnServer(newBalance)
        setBetAmount(bet)
        
        initGame()
        setLoading(false)
    }

    const handleCellClick = async (row, col) => {
        if (!gameActive) return
        if (board[row][col].isRevealed) return
        
        const cell = board[row][col]
        
        if (cell.isMine) {
            const updatedBoard = [...board]
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (updatedBoard[i][j].isMine) {
                        updatedBoard[i][j].isRevealed = true
                    }
                }
            }
            setBoard(updatedBoard)
            setGameActive(false)
            setGameResult({ win: false, amount: 0 })
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
        } else {
            const newRevealed = [...revealedCells, `${row},${col}`]
            setRevealedCells(newRevealed)
            
            const updatedBoard = [...board]
            updatedBoard[row][col].isRevealed = true
            setBoard(updatedBoard)
            
            if (cell.neighborMines === 0) {
                revealEmptyCells(updatedBoard, row, col, newRevealed)
            }
            
            const revealedCount = updatedBoard.flat().filter(c => c.isRevealed && !c.isMine).length
            const winMultiplier = multipliers[revealedCount] || 1
            const winAmount = Math.floor(betAmount * winMultiplier)
            setCurrentWin(winAmount)
            
            const safeCellsCount = TOTAL_CELLS - mineCount
            if (revealedCount === safeCellsCount) {
                const finalWin = winAmount
                const newBalance = balance - betAmount + finalWin
                await updateBalanceOnServer(newBalance)
                setGameActive(false)
                setGameResult({ win: true, amount: finalWin })
                setMessageType('success')
                setTimeout(() => setMessage(''), 4000)
            }
        }
    }

    const revealEmptyCells = (boardCopy, row, col, revealed) => {
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                const ni = row + di, nj = col + dj
                if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && !boardCopy[ni][nj].isRevealed && !boardCopy[ni][nj].isMine) {
                    boardCopy[ni][nj].isRevealed = true
                    revealed.push(`${ni},${nj}`)
                    if (boardCopy[ni][nj].neighborMines === 0) {
                        revealEmptyCells(boardCopy, ni, nj, revealed)
                    }
                }
            }
        }
        setBoard([...boardCopy])
        setRevealedCells([...revealed])
    }

    const cashOut = async () => {
        if (!gameActive || currentWin === 0) return
        
        const newBalance = balance + currentWin
        await updateBalanceOnServer(newBalance)
        setGameActive(false)
        setGameResult({ win: true, amount: currentWin })
        setMessageType('success')
        setTimeout(() => setMessage(''), 3000)
    }

    const safeCellsLeft = TOTAL_CELLS - mineCount - revealedCells.length
    const winMultiplier = multipliers[revealedCells.length] || 1

    return (
        <div className="minesweeper-page">
            {/* Фоновые ауры */}
            <div className="auras">
                <div className="aura aura-1"></div>
                <div className="aura aura-2"></div>
                <div className="aura aura-3"></div>
                <div className="aura aura-4"></div>
            </div>

            <div className="minesweeper-container">
                {/* Заголовок */}
                <div className="game-header">
                    <div className="glow-text">
                        <h1>💣 MINESWEEPER</h1>
                        <p>Испытай удачу и избегай мин!</p>
                    </div>
                </div>

                {/* Баланс */}
                <div className="balance-card">
                    <div className="balance-glow"></div>
                    <span className="balance-icon">💰</span>
                    <span className="balance-value">{balance}</span>
                    <span className="balance-label">монет</span>
                </div>

                {/* Настройки игры */}
                {!gameActive && !gameResult && (
                    <div className="game-settings glass-card">
                        <div className="settings-header">
                            <span className="settings-icon">⚙️</span>
                            <h3>Настройки игры</h3>
                        </div>
                        <div className="bet-section">
                            <label>💰 Сумма ставки</label>
                            <div className="bet-input-wrapper">
                                <input 
                                    type="number"
                                    value={customBet}
                                    onChange={(e) => setCustomBet(e.target.value)}
                                    min="10"
                                    max="10000"
                                />
                                <span className="bet-currency">₽</span>
                            </div>
                        </div>
                        <div className="mines-section">
                            <label>💣 Количество мин</label>
                            <div className="mine-buttons">
                                {[3, 5, 7, 10, 12, 15].map(count => (
                                    <button
                                        key={count}
                                        className={`mine-btn ${mineCount === count ? 'active' : ''}`}
                                        onClick={() => setMineCount(count)}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="start-btn" onClick={startNewGame} disabled={loading}>
                            <span className="btn-icon">🎮</span>
                            {loading ? 'ЗАПУСК...' : 'НАЧАТЬ ИГРУ'}
                        </button>
                    </div>
                )}

                {/* Игровое поле */}
                {gameActive && (
                    <>
                        <div className="game-info glass-card">
                            <div className="info-card">
                                <span className="info-icon">💎</span>
                                <div className="info-content">
                                    <span className="info-label">Потенциальный выигрыш</span>
                                    <span className="info-value win-value">{currentWin}</span>
                                </div>
                            </div>
                            <div className="info-card">
                                <span className="info-icon">🎯</span>
                                <div className="info-content">
                                    <span className="info-label">Множитель</span>
                                    <span className="info-value multiplier-value">x{winMultiplier}</span>
                                </div>
                            </div>
                            <div className="info-card">
                                <span className="info-icon">🟢</span>
                                <div className="info-content">
                                    <span className="info-label">Безопасных клеток</span>
                                    <span className="info-value">{safeCellsLeft}</span>
                                </div>
                            </div>
                            <button className="cashout-btn" onClick={cashOut} disabled={currentWin === 0}>
                                <span>🏆</span> ЗАБРАТЬ
                            </button>
                        </div>

                        <div className="board-wrapper">
                            <div className="board">
                                {board.map((row, i) => (
                                    <div key={i} className="board-row">
                                        {row.map((cell, j) => (
                                            <button
                                                key={`${i}-${j}`}
                                                className={`cell ${cell.isRevealed ? 'revealed' : 'hidden'} 
                                                    ${cell.isRevealed && cell.isMine ? 'mine' : ''}
                                                    ${cell.isRevealed && !cell.isMine && cell.neighborMines > 0 ? `number-${cell.neighborMines}` : ''}
                                                    ${hoveredCell === `${i},${j}` && !cell.isRevealed ? 'hovered' : ''}`}
                                                onClick={() => handleCellClick(i, j)}
                                                onMouseEnter={() => setHoveredCell(`${i},${j}`)}
                                                onMouseLeave={() => setHoveredCell(null)}
                                                disabled={!gameActive || cell.isRevealed}
                                            >
                                                <div className="cell-inner">
                                                    {cell.isRevealed && cell.isMine && '💣'}
                                                    {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && cell.neighborMines}
                                                    {cell.isRevealed && !cell.isMine && cell.neighborMines === 0 && '✨'}
                                                    {!cell.isRevealed && '?'}
                                                </div>
                                                {!cell.isRevealed && <div className="cell-shine"></div>}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Результат игры */}
                {gameResult && (
                    <div className={`game-result ${gameResult.win ? 'win' : 'lose'} glass-card`}>
                        <div className="result-animation">
                            <div className="result-icon">{gameResult.win ? '🏆' : '💀'}</div>
                            <h2>{gameResult.win ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}</h2>
                            {gameResult.win && (
                                <p className="win-amount">+{gameResult.amount} монет</p>
                            )}
                            <button className="play-again-btn" onClick={() => {
                                setGameResult(null)
                                startNewGame()
                            }}>
                                <span>🔄</span> ИГРАТЬ СНОВА
                            </button>
                        </div>
                    </div>
                )}

                {/* Таблица множителей */}
                <div className="multipliers-table glass-card">
                    <div className="table-header">
                        <span className="table-icon">📊</span>
                        <h3>Таблица множителей</h3>
                    </div>
                    <div className="multipliers-grid">
                        {Object.entries(multipliers).slice(0, 12).map(([cells, multi]) => (
                            <div key={cells} className="multiplier-item">
                                <span className="cells-count">{cells} клеток</span>
                                <span className="multiplier-value">x{multi}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Сообщение */}
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