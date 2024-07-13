import {createBrowserRouter} from "react-router-dom"
import App from "../App"
import RegisterPage from "../pages/RegisterPage"
import CheckEmailPage from "../pages/CheckEmailPage"
import CheckPassPage from "../pages/CheckPassPage"
import Home from "../pages/Home"
import MessPage from "../components/MessPage"
import AuthLayout from "../layouts/AuthLayout"

const router = createBrowserRouter([
    {
        path: "/",
        element:<App/>,
        children:[
            {
                path:"register",
                element: <AuthLayout><RegisterPage/></AuthLayout> 
            },
            {
                path:"email",
                element:<AuthLayout><CheckEmailPage/></AuthLayout>  
            },
            {
                path:"password",
                element:<AuthLayout><CheckPassPage/></AuthLayout>
            },
            {
                path:"",
                element:<Home/>,
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