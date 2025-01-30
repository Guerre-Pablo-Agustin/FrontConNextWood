"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCartData, removeItem, updateQuantity } from "@/redux/features/cart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Link from "next/link";
// import { useShoppingCartupdateUserMutation } from "@/redux/services/usersApi";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";

const Carrito = () => {
  const dispatch = useAppDispatch();
  const cartItems = useSelector((state) => state.cartReducer.cartItems);
  const user = useAppSelector((state) => state.useReducer.user);
  // const userToken = useAppSelector((state) => state.loginReducer.token);

  let idItems = [];

  cartItems.forEach((product) => {
    for (let i = 0; i < product.quantity; i++) {
      idItems.push(product._id);
    }
  });

  // const [updateCart] = useShoppingCartupdateUserMutation();

  const handleUpdateCart = async () => {
    // Saco solo los id de shoppingCart para ponerlo la bd
    const shoppingcart = [];
    cartItems.forEach((product) => {
      for (let i = 0; i < product.quantity; i++) {
        shoppingcart.push(product._id);
      }
    });
    try {
      if (userId && userId?._id && userToken) {
        const userID = userId?._id;
        const token = userToken;
        const shoppingCart = idItems;

        const config = {
          shoppingCart,
          userID,
          token,
        };

        // const { data, error } = await updateCart(config);

        if (error) {
          console.error("Error al actualizar el carrito:", error);
        } else {
          console.log("Carrito actualizado con éxito:", data);
        }
      } else {
        console.log(
          "Usuario no autenticado. No se actualizará el carrito en la base de datos."
        );
      }
    } catch (error) {
      console.error("Error general al actualizar el carrito:", error);
    }
  };
  // Elimino del localStorage y de la BD
  const handleRemoveItem = async (_id) => {
    dispatch(removeItem({ _id }));
    handleUpdateCart();
    toast.success("Removido del carrito");
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    const item = cartItems.find((item) => item._id === itemId);

    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= item.stock) {
      dispatch(updateQuantity({ itemId, newQuantity }));
    }

    await handleUpdateCart();
  };

  const handleInputChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      handleQuantityChange(item._id, newQuantity);
    }
  };

  const count = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isCartEmpty = cartItems.length === 0;

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2);
  };

  useEffect(() => {
    dispatch(getCartData());
  }, [dispatch]);

  // useEffect(() => {
  //   handleUpdateCart();
  // }, [handleUpdateCart]);

  return (
    <section className="p-4 mt-16 md:p-14 font-bold">
      <fieldset className="border  p-4 rounded-md ">
        <legend className="text-2xl p-8 text-start font-bold text-secondary ">
          Detalle del Carrito
        </legend>
        <div className=" flex flex-col p-4 -mt-8 rounded-lg shadow-md">
        {isCartEmpty ? (
        <p className="text-center">Tu carrito está vacío</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cartItems.map((item) => (
            <div key={item._id} className="border rounded-md p-4 shadow-md">
              <div className="mb-2 flex md:flex-row gap-4">
              <div className="mb-2">
                <Image width={200} height={200} src={item.image} alt={item.title} className="w-full h-48 object-contain rounded-md" legacyBehavior />
              </div>
              <div className="flex flex-col gap-2">
              <div className="mb-2">
                <Link legacyBehavior href={`/Details/${item._id}`}>
                  <p className="text-lg font-bold text-black">{item.title}</p>
                </Link>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Precio: </span>${item.price}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Cantidad: </span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value);
                    if (newQuantity >= 1 && newQuantity <= item.stock) {
                      handleQuantityChange(item._id, newQuantity);
                    }
                  }}
                  min="1"
                  max={item.stock}
                  className="w-16 p-1 text-center border"
                />
              </div>
              <div className="mb-2">
                <span className="font-semibold">Subtotal: </span>${item.subtotal.toFixed(2)}
              </div>
              <div className="text-center">
                <button
                  onClick={() => handleRemoveItem(item._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
          <div className="w-full flex  m-2 p-4 max-h-80">
            <fieldset className="border border-bggris  p-4 rounded-md">
              <legend className="text-base  text-start font-bold text-bgred p-4">
                Resumen del Carrito
              </legend>
              <div className="flex justify-end  overflow-auto">
                <div className=" flex-col">
                  <p>
                    Cant. de productos:
                    <span className="text-bgred ml-2">{count}</span>
                  </p>
                  <br />
                  <hr />
                  <br />
                  <p className=" text-xl flex text-start ">
                    Total:
                    <span className="text-bgred  ml-2 flex justify-end text-end">
                      $ {calculateTotal()}
                    </span>
                  </p>
                  <br />
                  {!isCartEmpty && (
                    <>
                      {user ? (
                        <Link href="/Checkout">
                          <button
                            className="bg-secondary text-white text-base py-2 px-10 rounded-lg mx-2 
                flex justify-center items-center text-center whitespace-nowrap hover:bg-bgred hover:text-white"
                          >
                            Finalizar Compra
                          </button>
                        </Link>
                      ) : (
                        <Link href="/Sign-in">
                          <button
                            className="bg-secondary text-white text-base py-2 px-10 rounded-lg mx-2 
                flex justify-center items-center text-center whitespace-nowrap hover:bg-bgred hover:text-white"
                          >
                            Inicia Sesión para Finalizar Compra
                          </button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </fieldset>

      {/* cierre del contenedor principal */}
    </section>
  );
};

export default Carrito;
