import React from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';
import './CartPopup.css';

interface CartPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout?: () => void;
}

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose, onCheckout }) => {
    const { cart, removeFromCart } = useStore();

    if (!isOpen) return null;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="cart-popup-overlay" onClick={onClose}>
            <div className="cart-popup-content" onClick={e => e.stopPropagation()}>
                <div className="cart-popup-header">
                    <h3>Your Cart ({cart.reduce((Acc, item) => Acc + item.quantity, 0)})</h3>
                    <button className="cart-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="cart-items-list">
                    {cart.length === 0 ? (
                        <div className="empty-cart-message">
                            Your cart is empty
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="cart-item-details">
                                    <h4>{item.name}</h4>
                                    <div className="cart-item-price">
                                        ${item.price.toFixed(2)} x {item.quantity}
                                    </div>
                                </div>
                                <button
                                    className="cart-item-remove"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-popup-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button className="checkout-btn" onClick={() => { onClose(); onCheckout?.(); }}>Continue to Checkout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPopup;
