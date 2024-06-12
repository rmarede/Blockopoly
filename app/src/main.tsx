import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './styles.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RealtiesPage from './pages/RealtiesPage.tsx'
import SalesPage from './pages/SalesPage.tsx'
import RentalsPage from './pages/RentalsPage.tsx'
import MortgagesPage from './pages/MortgagesPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import PropertyPage from './pages/RealtyPage.tsx'
import HomePage from './pages/HomePage.tsx'
import WalletPage from './pages/WalletPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage/>,
    errorElement: <NotFoundPage/>,
  },
  {
    path: '/realties',
    element: <RealtiesPage/>
  },
  {
    path: '/sales',
    element: <SalesPage/>
  },
  {
    path: '/rentals',
    element: <RentalsPage/>
  },
  {
    path: '/mortgages',
    element: <MortgagesPage/>
  },
  {
    path: '/realties/:id',
    element: <PropertyPage/>
  },
  {
    path: '/wallet',
    element: <WalletPage/>
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
