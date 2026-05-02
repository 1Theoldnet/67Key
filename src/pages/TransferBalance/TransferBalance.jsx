import './TransferBalanceStyle.scss'
import { useState, useEffect } from 'react'
import axios from 'axios'

export const TransferBalance = () => {
    const [users, setUsers] = useState([])
    const [myBalance, setMyBalance] = useState(0)
    const [selectedUserIndex, setSelectedUserIndex] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [amount, setAmount] = useState('')
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [myUserIndex, setMyUserIndex] = useState(null)
    const [myUserName, setMyUserName] = useState('')

    useEffect(() => {
        const userIndex = localStorage.getItem('userIndex')
        const userName = localStorage.getItem('userName')
        
        if (userIndex && userIndex !== 'null' && userIndex !== 'undefined') {
            setMyUserIndex(parseInt(userIndex))
            setMyUserName(userName || 'Пользователь')
            fetchUsers()
            fetchMyData(userIndex)
        }
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://six7keybackendnodejs.onrender.com/users')
            if (response.data) {
                // Добавляем индекс каждому пользователю
                const usersWithIndex = response.data.map((user, idx) => ({
                    ...user,
                    arrayIndex: idx
                }))
                setUsers(usersWithIndex)
            }
        } catch (error) {
            console.error('Ошибка получения пользователей:', error)
        }
    }

    const fetchMyData = async (userIndex) => {
        try {
            const response = await axios.get(`https://six7keybackendnodejs.onrender.com/user/${userIndex}`)
            if (response.data && !response.data.message) {
                setMyBalance(response.data.balance || 0)
            }
        } catch (error) {
            console.error('Ошибка получения данных:', error)
        }
    }

    // Фильтруем пользователей (исключаем себя)
    const filteredUsers = users.filter(user => 
        user.arrayIndex !== myUserIndex && 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleTransfer = async () => {
        if (!selectedUser) {
            setMessage('❌ Выберите пользователя для перевода')
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        const transferAmount = parseInt(amount)
        
        if (isNaN(transferAmount) || transferAmount <= 0) {
            setMessage('❌ Введите корректную сумму перевода')
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        if (transferAmount > myBalance) {
            setMessage(`❌ Недостаточно средств! Ваш баланс: ${myBalance} монет`)
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
            return
        }

        setLoading(true)

        try {
            // 1. Получаем данные отправителя
            const senderResponse = await axios.get(`https://six7keybackendnodejs.onrender.com/user/${myUserIndex}`)
            const sender = senderResponse.data
            
            if (!sender || sender.message) {
                setMessage('❌ Ошибка: отправитель не найден')
                setMessageType('error')
                return
            }

            // 2. Получаем данные получателя по его ИНДЕКСУ (arrayIndex)
            const receiverResponse = await axios.get(`https://six7keybackendnodejs.onrender.com/user/${selectedUser.arrayIndex}`)
            const receiver = receiverResponse.data
            
            if (!receiver || receiver.message) {
                setMessage('❌ Ошибка: получатель не найден')
                setMessageType('error')
                return
            }

            // 3. Обновляем баланс отправителя
            const newSenderBalance = myBalance - transferAmount
            await axios.put(`https://six7keybackendnodejs.onrender.com/user/edit/${myUserIndex}`, {
                avatarUrl: sender.avatarUrl || '',
                name: sender.name,
                password: sender.password,
                balance: newSenderBalance
            })

            // 4. Обновляем баланс получателя
            const newReceiverBalance = (receiver.balance || 0) + transferAmount
            await axios.put(`https://six7keybackendnodejs.onrender.com/user/edit/${selectedUser.arrayIndex}`, {
                avatarUrl: receiver.avatarUrl || '',
                name: receiver.name,
                password: receiver.password,
                balance: newReceiverBalance
            })

            setMyBalance(newSenderBalance)
            setMessage(`✅ Успешно переведено ${transferAmount} монет пользователю ${selectedUser.name}!`)
            setMessageType('success')
            setAmount('')
            setSelectedUser(null)
            setSelectedUserIndex(null)
            setSearchTerm('')
            
            // Обновляем список пользователей
            fetchUsers()
            
            setTimeout(() => setMessage(''), 4000)
        } catch (error) {
            console.error('Ошибка перевода:', error)
            setMessage(`❌ Ошибка при переводе: ${error.response?.data?.message || error.message}`)
            setMessageType('error')
            setTimeout(() => setMessage(''), 3000)
        } finally {
            setLoading(false)
        }
    }

    const handleMaxAmount = () => {
        setAmount(myBalance.toString())
    }

    return (
        <div className="transfer-page">
            <div className="transfer-container">
                {/* Мой профиль */}
                <div className="my-profile">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {myUserName.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <h2>{myUserName}</h2>
                            <div className="profile-balance">
                                <span className="balance-icon">💰</span>
                                <span className="balance-value">{myBalance}</span>
                                <span className="balance-label">монет</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Форма перевода */}
                <div className="transfer-form">
                    <h3>💸 Перевод баланса</h3>
                    
                    <div className="form-group">
                        <label>👤 Получатель</label>
                        <div className="search-box">
                            <input 
                                type="text"
                                placeholder="Поиск пользователя..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {searchTerm && filteredUsers.length > 0 && (
                            <div className="users-list">
                                {filteredUsers.slice(0, 5).map(user => (
                                    <div 
                                        key={user.arrayIndex}
                                        className={`user-item ${selectedUser?.arrayIndex === user.arrayIndex ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedUser(user)
                                            setSelectedUserIndex(user.arrayIndex)
                                        }}
                                    >
                                        <div className="user-avatar">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">{user.name}</div>
                                            <div className="user-balance">💰 {user.balance || 0} монет</div>
                                        </div>
                                        {selectedUser?.arrayIndex === user.arrayIndex && (
                                            <div className="check-mark">✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {selectedUser && (
                            <div className="selected-user">
                                <span>✅ Выбран: </span>
                                <strong>{selectedUser.name}</strong>
                                <button className="clear-btn" onClick={() => {
                                    setSelectedUser(null)
                                    setSelectedUserIndex(null)
                                }}>✖</button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>💎 Сумма перевода</label>
                        <div className="amount-input">
                            <input 
                                type="number"
                                placeholder="Введите сумму"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                                max={myBalance}
                            />
                            <button className="max-btn" onClick={handleMaxAmount}>
                                MAX
                            </button>
                        </div>
                        <div className="amount-hint">
                            Доступно: {myBalance} монет
                        </div>
                    </div>

                    {message && (
                        <div className={`message ${messageType}`}>
                            {message}
                        </div>
                    )}

                    <button 
                        className="transfer-btn"
                        onClick={handleTransfer}
                        disabled={loading || !selectedUser || !amount || parseInt(amount) > myBalance}
                    >
                        {loading ? '⏳ Перевод...' : '💸 Перевести'}
                    </button>
                </div>

                {/* Информация */}
                <div className="recent-transfers">
                    <h3>📜 Информация</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="info-icon">💡</span>
                            <span>Комиссия за перевод отсутствует</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">⚡</span>
                            <span>Перевод происходит мгновенно</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🔒</span>
                            <span>Безопасная транзакция</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">📊</span>
                            <span>Минимальная сумма перевода: 1 монета</span>
                        </div>
                    </div>
                </div>

                {/* Топ пользователей */}
                <div className="top-users">
                    <h3>🏆 Богатейшие пользователи</h3>
                    <div className="top-list">
                        {[...users]
                            .sort((a, b) => (b.balance || 0) - (a.balance || 0))
                            .slice(0, 5)
                            .map((user, index) => (
                                <div key={user.arrayIndex} className="top-item">
                                    <div className="top-rank">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                    </div>
                                    <div className="top-name">{user.name}</div>
                                    <div className="top-balance">💰 {user.balance || 0}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    )
}