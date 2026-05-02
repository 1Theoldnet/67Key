import './NotFoundStyles.scss'
import { useNavigate } from 'react-router-dom'

export const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className='notfound-page'>
            <div className="content">
                <div className="error-icon">🪐</div>
                <h1>Страница не найдена</h1>
                <p>Кажется, вы забрели в космическую пустоту...<br/>Но не переживайте, мы поможем вернуться!</p>
                <button onClick={() => navigate('/')}>
                    🌌 Вернуться на главную
                </button>
                <button className="secondary-btn" onClick={() => navigate(-1)}>
                    ↩️ Назад
                </button>
            </div>
        </div>
    )
}