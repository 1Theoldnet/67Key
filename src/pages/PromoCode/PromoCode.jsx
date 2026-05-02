import { useNavigate } from 'react-router-dom'
import './PromoCodeStyle.scss'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const PromoCode = () => {
    const nav = useNavigate()

    const [promoCode, setPromoCode] = useState('')

    const [error, setError] = useState('')
    
    useEffect(() => {
        if(!localStorage.getItem('userIndex')) {
            nav('/register')
            return
        }
    }, [])

    return (
        <div className='promocode-page'>
            <form onSubmit={e => {
                e.preventDefault()

                if(promoCode.trim() === '') {
                    setError('Введите имя пользователя')
                    return
                }

                setError('')

                axios.post(`https://six7keybackendnodejs.onrender.com/user/activePromoCode/${localStorage.getItem('userIndex')}`, { promoCode })
                .then(res => {
                    setError(res.data.message)
                })
            }}>
                <input type='text' placeholder='Введте промокод' value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                {error.trim() !== '' && <p style={{ color: 'white' }}>⚠️ {error}</p>}
                <button>Активировать</button>
            </form>
        </div>
    )
}