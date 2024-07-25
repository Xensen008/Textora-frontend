import {createBrowserRouter} from "react-router-dom"
import App from "../App"
import RegisterPage from "../pages/RegisterPage"
import CheckEmailPage from "../pages/CheckEmailPage"
import CheckPassPage from "../pages/CheckPassPage"
import Home from "../pages/Home"
import MessPage from "../components/MessPage"
import ForgotPasswordPage from "../pages/ForgotPasswordPage"
import MainHomeParents from "../pages/MainHomeParents"

const router = createBrowserRouter([
    {
        path: "/",
        element:<App/>,
        children:[
            {
                path:"register",
                element: <RegisterPage/> 
            },
            {
                path:"email",
                element:<CheckEmailPage/>  
            },
            {
                path:"password",
                element:<CheckPassPage/>
            },
            {
                path:"forgot-password",
                element:<ForgotPasswordPage/>
            },
            {
                path:"",
                element:<MainHomeParents/>,
                children:[
                    {
                        path:':userId',
                        element:<MessPage/>
                    }
                ]
            },

        ]
    }
])

export default router