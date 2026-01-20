import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import MealList from "./pages/MealList";
import MealDetails from "./pages/MealDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Contact from "./pages/Contact";
import ReferralScreen from "./pages/Referral";
import WelcomeScreen from "./pages/WelcomeScreen";
import ResetPassword from "./components/ResetPassword";
import Wallet from "./pages/Wallet";
import Vendor from "./pages/Vendor";
import OrderDetails from "./pages/OrderDetails";
import SplashPage from "./pages/SplashPage";
import Vendors from "./pages/Vendors";
import vendors from "./components/Vendors";
import Promotions from "./pages/Promotions";

const userId = localStorage.getItem("userId");
const routes = [
  { path: userId ? "/" : "/home", element: <Home /> },
  { path: "/onboarding", element: <Onboarding /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/meals", element: <MealList /> },
  { path: "/meals/:id", element: <MealDetails /> },
  { path: "/cart", element: <Cart /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/profile", element: <Profile /> },
  { path: "/vendors", element: <Vendors /> },
  { path: "/orders", element: <Orders /> },
  { path: "/contact", element: <Contact /> },
  { path: "/promotions", element: <Promotions /> },
  { path: "/referral", element: <ReferralScreen /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/wallet", element: <Wallet /> },
  { path: "/vendor/:name", element: <Vendor /> },
  { path: "/orderdetails", element: <OrderDetails /> },
  { path: "/splashpage", element: <SplashPage /> },
  !userId && { path: "/", element: <WelcomeScreen /> },
].filter(Boolean); // <--- this removes falsy items
export default routes;
