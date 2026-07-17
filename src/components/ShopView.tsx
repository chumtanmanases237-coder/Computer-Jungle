/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { ShoppingCart, ShoppingBag, Plus, Minus, X, Trash2, Printer, CheckCircle2, ShieldAlert, Barcode, Laptop, Tag, RefreshCw, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

interface ShopViewProps {
  products: Product[];
  onRefreshProducts: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ShopView({ products, onRefreshProducts }: ShopViewProps) {
  const [activeTab, setActiveTab] = useState<"Customer" | "POS">("Customer");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout states
  const [customerName, setCustomerName] = useState("Chief Sango of Fiango");
  const [customerEmail, setCustomerEmail] = useState("sango@gmail.com");
  const [customerPhone, setCustomerPhone] = useState("+237 671 23 45 67");
  const [paymentMethod, setPaymentMethod] = useState<"MTN Mobile Money" | "Orange Money" | "Stripe" | "PayPal" | "Cash">("MTN Mobile Money");
  const [deliveryMethod, setDeliveryMethod] = useState<"Pickup" | "Delivery">("Pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("Fiango Junction, Kumba");

  const [checkoutResult, setCheckoutResult] = useState<any | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // POS Cashier Register States
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState<number>(50000);
  const [posReceipt, setPosReceipt] = useState<any | null>(null);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const match = prev.find((item) => item.product.id === product.id);
      if (match) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: Math.min(item.product.stock, Math.max(1, newQty)) };
          }
          return item;
        })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, curr) => acc + curr.product.priceCFAF * curr.quantity, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckingOut(true);

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        items: cart.map((c) => ({
          productId: c.product.id,
          productName: c.product.name,
          quantity: c.quantity,
          priceCFAF: c.product.priceCFAF,
        })),
        totalCFAF: calculateTotal(),
        paymentMethod,
        deliveryMethod,
        deliveryAddress,
      };

      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setCheckoutResult(data.order);
        setCart([]);
        setIsCartOpen(false);
        onRefreshProducts(); // Deduct inventory
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOut(false);
    }
  };

  // --- POS Cashier functions ---
  const scanBarcodeSimulator = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod || prod.stock <= 0) return;

    setPosCart((prev) => {
      const match = prev.find((item) => item.product.id === prodId);
      if (match) {
        return prev.map((item) =>
          item.product.id === prodId ? { ...item, quantity: Math.min(prod.stock, item.quantity + 1) } : item
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const removePosItem = (id: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const calculatePosTotal = () => {
    return posCart.reduce((acc, curr) => acc + curr.product.priceCFAF * curr.quantity, 0);
  };

  const handlePOSCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) return;

    try {
      const payload = {
        customerName: "Walk-In Cash Customer",
        customerEmail: "cashier.sales@computerjungle.com",
        customerPhone: "+237 POS-REGISTER",
        items: posCart.map((c) => ({
          productId: c.product.id,
          productName: c.product.name,
          quantity: c.quantity,
          priceCFAF: c.product.priceCFAF,
        })),
        totalCFAF: calculatePosTotal(),
        paymentMethod: "Cash" as const,
        deliveryMethod: "Pickup" as const,
      };

      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setPosReceipt({
          ...data.order,
          cashReceived,
          change: Math.max(0, cashReceived - calculatePosTotal()),
        });
        setPosCart([]);
        onRefreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Toggle between E-Commerce and POS Barcode Register */}
      <div className="flex justify-between items-center bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800 max-w-md mx-auto">
        <button
          onClick={() => {
            setActiveTab("Customer");
            setCheckoutResult(null);
            setPosReceipt(null);
          }}
          className={`flex-1 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === "Customer" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Customer E-Commerce Shop
        </button>
        <button
          onClick={() => {
            setActiveTab("POS");
            setCheckoutResult(null);
            setPosReceipt(null);
          }}
          className={`flex-1 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === "POS" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Cashier Barcode POS Register
        </button>
      </div>

      {activeTab === "Customer" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Shop Product Catalogue */}
          <div className="lg:col-span-8 space-y-6">
            {checkoutResult && (
              <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl text-center space-y-4">
                <div className="bg-blue-600 h-12 w-12 rounded-full text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black text-zinc-100">E-Commerce Checkout Completed!</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Thank you! Your order <strong>{checkoutResult.id}</strong> has been logged. Delivery/Pickup instructions are being prepared.
                </p>

                {/* Printable receipt card */}
                <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl max-w-sm mx-auto text-left font-mono text-[11px] text-zinc-400 space-y-2.5 shadow-sm">
                  <div className="text-center pb-2 border-b border-zinc-800">
                    <span className="font-bold text-zinc-100 block">COMPUTER JUNGLE SHOP</span>
                    <span>Confidence Street Junction, Fiango</span>
                  </div>
                  <div>
                    <p><strong className="text-zinc-500">Order ID:</strong> {checkoutResult.id}</p>
                    <p><strong className="text-zinc-500">Customer:</strong> {checkoutResult.customerName}</p>
                    <p><strong className="text-zinc-500">Phone:</strong> {checkoutResult.customerPhone}</p>
                  </div>
                  <div className="border-t border-dashed border-zinc-800 pt-2 space-y-1">
                    {checkoutResult.items.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{it.productName} (x{it.quantity})</span>
                        <span>{(it.priceCFAF * it.quantity).toLocaleString()} CFAF</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-dashed border-zinc-800 pt-2 flex justify-between font-bold text-zinc-100 text-xs">
                    <span>TOTAL CHARGED:</span>
                    <span className="text-blue-400">{checkoutResult.totalCFAF.toLocaleString()} CFAF</span>
                  </div>
                  <div className="text-center text-[9px] text-zinc-500 pt-1">
                    Receipt Generated Online &bull; Save / Print PDF
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-600/10"
                  >
                    Print Shop Invoice Receipt
                  </button>
                  <button
                    onClick={() => setCheckoutResult(null)}
                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}

            {/* Inventory Alerts / Shop banner */}
            <div className="bg-zinc-900/40 border border-zinc-800 text-zinc-100 rounded-2xl p-6 relative overflow-hidden flex items-center justify-between shadow-lg">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="space-y-1.5 relative z-10">
                <span className="text-[9px] font-mono tracking-widest text-blue-400 uppercase">Hardware Inventory Depot</span>
                <h3 className="text-base font-bold tracking-tight">Original Laptops & Computer Accessories</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                  We supply 100% genuine tested computing laptops and diagnostic equipment to South West Region clients.
                </p>
              </div>
              <ShoppingBag className="h-10 w-10 text-blue-500/20 shrink-0 hidden sm:block" />
            </div>

            {/* Grid display products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
                >
                  <div className="relative">
                    <img src={p.imageUrl} alt={p.name} className="h-44 w-full object-cover" />
                    <span className="absolute top-3 left-3 bg-zinc-950/90 border border-zinc-800 text-blue-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md font-mono tracking-wider">
                      {p.category}
                    </span>
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md font-mono animate-pulse">
                        LOW STOCK ({p.stock})
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{p.name}</h4>
                      <span className="text-xs font-mono font-black text-blue-400 shrink-0">
                        {p.priceCFAF.toLocaleString()} CFAF
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{p.description}</p>

                    <div className="space-y-1.5 pt-2">
                      {p.specifications.slice(0, 2).map((spec, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                          <span className="h-1 w-1 bg-zinc-700 rounded-full" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock <= 0}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs py-2 rounded-xl cursor-pointer transition-colors"
                    >
                      {p.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sliding Cart Panel / Shopping register */}
          <div className="lg:col-span-4 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5 border-b border-zinc-800 pb-2 mb-4">
              <ShoppingCart className="h-4.5 w-4.5 text-blue-400" />
              <span>Your Shopping Cart ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-2">
                <ShoppingBag className="h-8 w-8 text-zinc-600 mx-auto" />
                <h4 className="font-bold text-xs text-zinc-400">Your cart is empty</h4>
                <p className="text-[10px] max-w-xs mx-auto">Explore original hardware products and add laptops or adapters to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Items list */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center gap-2 bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs shadow-sm">
                      <div className="truncate flex-1">
                        <span className="font-bold text-zinc-200 truncate block">{item.product.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{(item.product.priceCFAF * item.quantity).toLocaleString()} CFAF</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="p-1 text-zinc-400 hover:bg-zinc-800"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-[10px] font-bold px-2 font-mono text-zinc-300">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="p-1 text-zinc-400 hover:bg-zinc-800"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-400 hover:bg-red-950/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing summary */}
                <div className="border-t border-zinc-800 pt-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">{calculateTotal().toLocaleString()} CFAF</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tax (TVA 19.25%):</span>
                    <span className="font-mono text-zinc-500">Included</span>
                  </div>
                  <div className="flex justify-between font-black text-zinc-100 text-sm border-t border-dashed border-zinc-800 pt-2.5">
                    <span>TOTAL PRICE:</span>
                    <span className="text-blue-400">{calculateTotal().toLocaleString()} CFAF</span>
                  </div>
                </div>

                {/* Checkout Mini Form */}
                <form onSubmit={handleCheckout} className="space-y-3.5 pt-3 border-t border-zinc-800">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Wallet</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full text-xs px-2 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none"
                      >
                        <option className="bg-zinc-950 text-zinc-100">MTN Mobile Money</option>
                        <option className="bg-zinc-950 text-zinc-100">Orange Money</option>
                        <option className="bg-zinc-950 text-zinc-100">Stripe</option>
                        <option className="bg-zinc-950 text-zinc-100">PayPal</option>
                        <option className="bg-zinc-950 text-zinc-100">Cash</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Delivery Method</label>
                      <select
                        value={deliveryMethod}
                        onChange={(e) => setDeliveryMethod(e.target.value as any)}
                        className="w-full text-xs px-2 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none"
                      >
                        <option className="bg-zinc-950 text-zinc-100">Pickup</option>
                        <option className="bg-zinc-950 text-zinc-100">Delivery</option>
                      </select>
                    </div>
                    {deliveryMethod === "Delivery" && (
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Address</label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={checkingOut}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/10"
                  >
                    {checkingOut ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Place Shop Order"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* POS Cashier Register System with Barcode and Sales Reports */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Register scanner simulator */}
          <div className="lg:col-span-8 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-2">
                <Barcode className="h-5 w-5 text-blue-400" />
                <span>POS Cashier Interface & Barcode Simulation</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simulate a fast hardware cashier terminal. Select a product to scan its barcode directly.
              </p>
            </div>

            {posReceipt && (
              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-400" />
                  <span>POS TRANSACTION SUCCESSFUL</span>
                </div>
                
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl font-mono text-[11px] text-zinc-400 space-y-1 max-w-sm">
                  <div className="text-center pb-2 border-b border-zinc-800 mb-2">
                    <strong className="text-zinc-100 block text-xs">CJTC HIGH SPEED POS RECEIPT</strong>
                    <span>Reg No: REG-CJ-POS-{Math.floor(100 + Math.random() * 900)}</span>
                  </div>
                  <p><strong className="text-zinc-500">Ref Code:</strong> {posReceipt.id}</p>
                  <p><strong className="text-zinc-500">Date:</strong> {new Date().toLocaleDateString()}</p>
                  <div className="border-t border-dashed border-zinc-800 pt-2 pb-2 space-y-1">
                    {posReceipt.items.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.productName} (x{it.quantity})</span>
                        <span>{(it.priceCFAF * it.quantity).toLocaleString()} CFAF</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-zinc-100 text-xs">
                    <span>NET TOTAL:</span>
                    <span className="text-blue-400">{posReceipt.totalCFAF.toLocaleString()} CFAF</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 mt-0.5">
                    <span>Cash Received:</span>
                    <span>{posReceipt.cashReceived.toLocaleString()} CFAF</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-400">
                    <span>Change:</span>
                    <span>{posReceipt.change.toLocaleString()} CFAF</span>
                  </div>
                  <div className="text-center text-[8px] text-zinc-500 pt-3 border-t border-dashed border-zinc-800 mt-3 uppercase">
                    Motto: &quot;In Computer, We Trust&quot;
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-600/10"
                  >
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setPosReceipt(null)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors"
                  >
                    Next Sale
                  </button>
                </div>
              </div>
            )}

            {/* Simulated Barcode list */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => scanBarcodeSimulator(p.id)}
                  className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl cursor-pointer text-left transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] font-mono font-bold bg-zinc-950 text-blue-400 px-1.5 py-0.5 rounded uppercase border border-zinc-800">
                      Code: {p.id}
                    </span>
                    <span className="text-[10px] text-zinc-550 font-mono">Stock: {p.stock}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-300 truncate block group-hover:text-blue-400">{p.name}</span>
                  
                  {/* barcode lines drawing */}
                  <div className="h-6.5 bg-zinc-950 border border-zinc-850 rounded flex items-center justify-between px-2 text-[6px] font-mono text-zinc-400 select-none tracking-widest leading-none">
                    ||| | |||| | ||||| | |||
                  </div>
                </button>
              ))}
            </div>

            {/* Quick stock/inventory panel overview */}
            <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-450 leading-relaxed">
                <strong>Inventory Warning limits:</strong> Low stock count triggers automatically when products stock falls below 10. Cashiers can restock directly from the principal administrative dashboard.
              </div>
            </div>
          </div>

          {/* POS Bill cart right drawer */}
          <div className="lg:col-span-4 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 space-y-5">
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <ShoppingBag className="h-4.5 w-4.5 text-blue-400" />
              <span>POS Register Cart</span>
            </h3>

            {posCart.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Scan barcode button on left to add hardware items to the active register sheet.
              </div>
            ) : (
              <form onSubmit={handlePOSCheckout} className="space-y-4">
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {posCart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center text-xs bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                      <div className="truncate flex-1 pr-4">
                        <strong className="text-zinc-200 truncate block">{item.product.name}</strong>
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.quantity} x {item.product.priceCFAF.toLocaleString()} CFAF</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePosItem(item.product.id)}
                        className="text-red-400 hover:bg-red-950/20 p-1 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-3.5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between font-black text-zinc-100 text-xs">
                    <span>NET TOTAL:</span>
                    <span className="text-blue-400">{calculatePosTotal().toLocaleString()} CFAF</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cash Received CFAF</label>
                  <input
                    type="number"
                    required
                    min={calculatePosTotal()}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-mono font-bold"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 pt-1">
                    <span>Estimated Change:</span>
                    <span className="font-bold text-blue-400">{Math.max(0, cashReceived - calculatePosTotal()).toLocaleString()} CFAF</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl cursor-pointer transition-all shadow-md shadow-blue-600/10"
                >
                  Authorize Sale & Print Receipt
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
