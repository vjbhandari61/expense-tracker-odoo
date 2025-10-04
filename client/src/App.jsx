import AuthPage from "./pages/AuthPage"
import AdminPage from "./pages/AdminPage"
import EmployeePage from "./pages/EmployeePage"
import ManagerPage from "./pages/ManagerPage"
import LoginPage from "./components/auth/LoginPage"
import SignupPage from "./components/auth/SignupPage"
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthPage />
  },
  {
    path: "login",
    element: <LoginPage />
  },
  {
    path: "admin",
    element: <AdminPage />
  },
  {
    path: "employee",
    element: <EmployeePage />
  },
  {
    path: "manager",
    element: <ManagerPage />
  },
  {
    path: "signup",
    element: <SignupPage />
  }

]
)

function App() {

  return (
    <>
      <RouterProvider router={router} />
      {/* <EmployeePage/> */}
    </>
  )
}

export default App
