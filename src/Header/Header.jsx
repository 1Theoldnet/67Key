import './HeaderStyle.scss'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export const Header = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const menuRef = useRef(null)

    // Функция для форматирования числа с пробелами
    const formatBalance = (balance) => {
        if (balance === undefined || balance === null) return '0'
        return balance.toLocaleString('ru-RU').replace(/,/g, ' ')
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const userIndex = localStorage.getItem('userIndex')
            if (userIndex && userIndex !== 'undefined') {
                axios.get(`https://six7keybackendnodejs.onrender.com/user/${userIndex}`)
                    .then(res => {
                        if (res.data && !res.data.message) {
                            setUser(res.data)
                        }
                    })
                    .catch(err => console.error(err))
            }
        }, 3000) // 3 секунды

        return () => clearInterval(interval)
    }, [])

    // Закрытие меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMobileMenuOpen(false)
                document.querySelector('.nav-menu')?.classList.remove('mobile-open')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const logout = () => {
        localStorage.removeItem('userIndex')
        setUser(null)
        navigate('/login')
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
        document.querySelector('.nav-menu')?.classList.toggle('mobile-open')
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
        document.querySelector('.nav-menu')?.classList.remove('mobile-open')
    }

    return (
        <header className="glass-header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/" onClick={closeMobileMenu}>
                        <span className="logo-icon">✨</span>
                        <span className="logo-text">67key casino</span>
                    </Link>
                </div>

                <nav className="nav-menu" ref={menuRef}>
                    <Link to="/clicker" className="nav-link" onClick={closeMobileMenu}>🖱️ Кликер</Link>
                    <Link to="/avtomat" className="nav-link" onClick={closeMobileMenu}>🎰 Автомат</Link>
                    <Link to="/minesweeper" className="nav-link" onClick={closeMobileMenu}>💣 Сапёр</Link>
                    <Link to="/cases" className="nav-link" onClick={closeMobileMenu}>🎲 Кейсы</Link>
                    <Link to="/transfer" className="nav-link" onClick={closeMobileMenu}>💸 Перевод</Link>
                    <Link to="/promo-code" className="nav-link" onClick={closeMobileMenu}>🎁 Промокоды</Link>
                    <Link to="/users" className="nav-link" onClick={closeMobileMenu}>👥 Пользователи</Link>
                </nav>

                <div className="header-actions">
                    {user ? (
                        <>
                            <div className="balance-display">
                                <span className="balance-icon">💰</span>
                                <span className="balance-value">{formatBalance(user.balance)}</span>
                            </div>
                            <Link to="/editprofile" className="profile-link">
                                <div className="avatar">
                                    {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>👤</span>}
                                </div>
                                <span className="user-name">{user.name}</span>
                            </Link>
                            <button onClick={logout} className="logout-btn">🚪 Выйти</button>
                        </>
                    ) : null}
                </div>

                <div className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </header>
    )
}