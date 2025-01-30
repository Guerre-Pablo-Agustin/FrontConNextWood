"use client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getCartData } from "@/redux/features/cart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { cleanCart } from "@/redux/features/cart";
import { useNewPurchaseMutation } from "@/redux/services/purchaseHistoryApi";
import { ToastContainer, toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  const cartItems = useSelector((state) => state.cartReducer.cartItems);
  // const userId = useAppSelector((state) => state.loginReducer.user);
  // const userToken = useAppSelector((state) => state.loginReducer.token);
  const dispatch = useAppDispatch();

  // const [createPurchase] = useNewPurchaseMutation();

  useEffect(() => {
    dispatch(getCartData());
  }, [dispatch]);

  const count = cartItems.reduce((total, item) => total + item.quantity, 0);

  const calculateTotal = () => {
    const total = cartItems
      .reduce((acc, item) => acc + item.subtotal, 0)
      .toFixed(2);
    return total;
  };
  const totalPay = calculateTotal();
  console.log("CartItems:", cartItems);

  const handleCreateOrder = async () => {
    try {
      await dispatch(getCartData());

      const response = await fetch("/api/Checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartData: cartItems }),
      });

      if (response.ok) {
        const orderData = await response.json();
        console.log("Respuesta del backend:", orderData);
        return orderData.cartData.id;
      } else {
        const errorText = await response.text();
        console.error(
          "Error en la solicitud al backend:",
          response.status,
          errorText
        );
        throw new Error(`Error en la solicitud al backend: ${response.status}`);
      }
    } catch (error) {
      console.error("Error al procesar la respuesta del backend:", error);
    }
  };

  const sendEmail = async () => {
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItems,
          userId: userId,
          totalPay: totalPay,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
      toast.success("Your email message has been sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(
        "An error occurred while sending the email. Please try again."
      );
    }
  };

  let cartItemsId = [];

  cartItems.forEach((product) => {
    for (let i = 0; i < product.quantity; i++) {
      cartItemsId.push(product._id);
    }
  });

  const purchase = {
    // user: userId,
    product: cartItemsId,
  };

  const handlePurchase = async () => {
    try {
      const config = {
        purchase: purchase,
        token: userToken,
      };

      const { data, error } = await createPurchase(config);
      console.log("Respuesta del backend:", data);
      sendEmail();
    } catch (error) {
      console.error("Error al procesar la respuesta del backend:", error);
    }
  };

  const saveCartItemsToLocalStorage = (items) => {
    localStorage.setItem("purchasedItems", JSON.stringify(items));
  };

  return (
    <div className="p-4 mt-16 md:p-14 font-bold">
      <fieldset className="border  p-4 rounded-md ">
        <legend className="text-2xl p-8 text-start font-bold text-bgred ">
          Checkout
        </legend>
        <div className=" flex flex-col gap-4 p-4 -mt-8 rounded-lg shadow-md">
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
          <div className="flex justify-start m-2 p-4 ">
            <fieldset className="border border-bggris w-[90%]  p-4 rounded-md">
              <legend className="text-base  text-start font-bold text-bgred p-4">
                Resumen del Carrito
              </legend>
              <div className="flex w-full h-full  overflow-auto">
                <div className=" flex-col px-6 py-4">
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
                  <div className=" text-xl">
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                      }}
                    >
                      <PayPalButtons
                        className=""
                        style={{
                          layout: "horizontal",
                          label: "pay",
                          shape: "rect",
                          height: 40,
                        }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  currency_code: "USD",
                                  value: totalPay,
                                  breakdown: {
                                    item_total: {
                                      currency_code: "USD",
                                      value: totalPay,
                                    },
                                  },
                                },
                                items: cartItems.map((item) => ({
                                  name: item.title,
                                  description: item.description,
                                  unit_amount: {
                                    currency_code: "USD",
                                    value: parseFloat(item.price.toFixed(2)),
                                  },
                                  quantity: item.quantity.toString(),
                                  amount: {
                                    currency_code: "USD",
                                    value: parseFloat(item.subtotal),
                                  },
                                })),
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          try {
                            const order = await actions.order?.capture();
                            console.log("order: ", order);

                            // Guarda los productos en el local storage
                            saveCartItemsToLocalStorage(cartItems);

                            handlePurchase();
                            dispatch(cleanCart());
                          } catch (error) {
                            console.log("error onApprove", error);
                          }
                        }}
                        onCancel={() => {
                          console.log("compra cancelada");
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </fieldset>

      <ToastContainer theme="colored" position="top-center" autoClose={2000} />
    </div>
  );
};

export default Page;
