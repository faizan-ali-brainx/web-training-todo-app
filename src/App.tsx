import { useEffect } from 'react'
import { useAppDispatch } from './app/hooks'
import { rehydrateSession } from './features/auth/authSlice'
import { AppRouter } from './routes/AppRouter'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(rehydrateSession())
  }, [dispatch])

  return <AppRouter />
}

export default App
