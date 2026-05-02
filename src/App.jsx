import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Register } from './pages/Register/Register'
import { Login } from './pages/Login/Login'
import { NotFound } from './pages/NotFound/NotFound'
import { Header } from './Header/Header'
import { PromoCode } from './pages/PromoCode/PromoCode'
import { Avtomat } from './pages/Avtomat/Avtomat'
import { Users } from './pages/Users/Users'
import { Home } from './pages/Home/Home'
import { TransferBalance } from './pages/TransferBalance/TransferBalance'
import { Clicker } from './pages/Clicker/Clicker' // Правильный импорт

const isAuthenticated = () => {
    const userIndex = localStorage.getItem('userIndex')
    return userIndex && userIndex !== 'null' && userIndex !== 'undefined'
}

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/register" replace />
}

const PublicRoute = ({ children }) => {
    return !isAuthenticated() ? children : <Navigate to="/" replace />
}

export const App = () => {
    const location = useLocation()
    const hideHeader = location.pathname === '/login' || location.pathname === '/register'

    return (
        <>
            {!hideHeader && <Header />}
            
            <Routes>
                <Route path='/' element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path='/users' element={<PrivateRoute><Users /></PrivateRoute>} />
                <Route path='/avtomat' element={<PrivateRoute><Avtomat /></PrivateRoute>} />
                <Route path='/transfer' element={<PrivateRoute><TransferBalance /></PrivateRoute>} />
                <Route path='/promo-code' element={<PrivateRoute><PromoCode /></PrivateRoute>} />
                <Route path='/clicker' element={<PrivateRoute><Clicker /></PrivateRoute>} />
                <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />
                <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
                <Route path='*' element={<NotFound />} />
            </Routes>
        </>
    )
}