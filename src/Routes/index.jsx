import {createBrowserRouter} from "react-router-dom"
import App from "../App"
import RegisterPage from "../pages/RegisterPage"
import CheckEmailPage from "../pages/CheckEmailPage"
import CheckPassPage from "../pages/CheckPassPage"
import Home from "../pages/Home"
import MessPage from "../components/MessPage"

const router = createBrowserRouter([
    {
        path: "/",
        element:<App/>,
        children:[
            {
                path:"register",
                element:<RegisterPage/>
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