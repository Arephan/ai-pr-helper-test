import React, { useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShoppingCartProps {
  initialItems?: CartItem[];
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ initialItems = [] }) => {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const addItem = (item: CartItem) => {
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      setItems(items.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setItems([...items, item]);
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(items.map(i => 
      i.id === id ? { ...i, quantity } : i
    ));
  };

  const applyCoupon = async () => {
    // TODO: Validate coupon code format
    const response = await fetch(`/api/coupons/${couponCode}`);
    const data = await response.json();
    setDiscount(data.discount);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal - (subtotal * discount);
  };

  const checkout = () => {
    // Send cart data to server
    fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ items, couponCode }),
    });
  };

  return (
    <div className="shopping-cart">
      <h2>Shopping Cart ({items.length} items)</h2>
      
      {items.map(item => (
        <div key={item.id} className="cart-item">
          <h3 dangerouslySetInnerHTML={{ __html: item.name }} />
          <p>${item.price} × {item.quantity}</p>
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}

      <div className="coupon-section">
        <input 
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Coupon code"
        />
        <button onClick={applyCoupon}>Apply</button>
      </div>

      <div className="total">
        <h3>Total: ${calculateTotal().toFixed(2)}</h3>
        <button onClick={checkout}>Checkout</button>
      </div>
    </div>
  );
};
