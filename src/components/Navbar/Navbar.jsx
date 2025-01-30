"use client";

import { usePathname, useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faShoppingCart,
  faInfoCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getlogindata, logoutUser } from "@/redux/features/userSlice";
import Image from "next/image";
import Buscador from "../Buscador/Buscador";
import logo from "../../../public/images/ecowood.jpg";
import { MdClose, MdMenu, MdOutlineShoppingCart } from "react-icons/md";

const Navbar = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const user = useSelector((state) => state.useReducer.user);
  const [localUser, setLocalUser] = useState(user);

  const cartItems = useAppSelector((state) => state.cartReducer.cartItems);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    if (count !== cartItemsCount) {
      setCartItemsCount(count);
    }
  }, [cartItems, cartItemsCount]);

  const categories = [
    { name: "Todos", path: "todos" },
    { name: "Utensilios de cocina", path: "utensilios" },
    { name: "Muebles", path: "muebles" },
    { name: "Juguetes", path: "juguetes" },
  ];

  useEffect(() => {
    dispatch(getlogindata());
  }, [dispatch]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    dispatch(logoutUser());
    setLocalUser(null);
    router.push("/Sign-in");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Buscar productos con:", searchQuery);
    window.location.href = `/SearchPage?query=${searchQuery}`;
  };

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };


  return (
    <nav className="bg-white w-full shadow-md p-4">
    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/">Logo</Link>
      </div>
      <div className="md:hidden">
        <button onClick={toggleMenu} className="text-2xl">
          {isOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>
      <div className={`md:flex ${isOpen ? "block" : "hidden"} w-full md:w-auto`}>
        <ul className="flex flex-col md:flex-row md:items-center">
          {categories.map((category) => (
            <li key={category.path} className="p-2">
              <Link href={`/products/${category.path}`}>{category.name}</Link>
            </li>
          ))}
          <li className="p-2">
            <Link legacyBehavior href="/cart">
              <a className="flex items-center">
                <MdOutlineShoppingCart className="mr-1" />
                {cartItemsCount}
              </a>
            </Link>
          </li>
          {localUser ? (
            <li className="p-2">
              <Link href="/Profile">Perfil</Link>
            </li>
          ) : (
            <li className="p-2">
              <Link href="/login">Iniciar sesión</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  </nav>
  );
};

export default Navbar;
