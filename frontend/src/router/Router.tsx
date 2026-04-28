import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import {Home} from '../pages/Home'

// Discommented for apply protected routes
// function ProtectedLayout() {
//     const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

//     if (!isLoggedIn) {
//         return <Navigate to="/auth/login" replace />;
//     }

//     return <Outlet />;
// }

// function PublicOnlyRoute({ children }) {
//   const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

//   if (isLoggedIn) {
//     return <Navigate to="/home" replace />
//   }

//   return children
// }

export default function Router() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Redirect to home */}
                    <Route  path="/" element={<Navigate to={"home/"} replace/>}/>

                    {/* Home */}
                    <Route path="/home" element={<Home/>}/>z
                </Routes>
            </BrowserRouter>
        </>
    )
}
