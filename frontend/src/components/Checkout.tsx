// src/components/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { Stack, Text, TextField, PrimaryButton, ITextFieldProps, Spinner } from '@fluentui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  name: string;
  email: string;
  address: string;
}

interface BasketItem {
  basket_item_id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

interface BasketData {
  items: BasketItem[];
  total: number;
}

interface CheckoutProps {
  userId: number;
  id?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ userId, id }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    address: ''
  });
  const [basketData, setBasketData] = useState<BasketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBasket();
  }, [userId]);

  const fetchBasket = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<BasketData>(`http://localhost:3002/api/basket/${userId}`);
      setBasketData(response.data);
    } catch (error) {
      console.error('Error fetching basket:', error);
      setError('Failed to fetch basket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    const { name } = e.target as HTMLInputElement | HTMLTextAreaElement;
    setFormData({ ...formData, [name]: newValue || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basketData) {
      setError('Basket data is not available. Please try again.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3002/api/checkout', { 
        userId, 
        ...formData, 
        totalAmount: basketData.total,
        items: basketData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      });
      console.log('checkout', response.data);
      navigate(`/confirm-payment?orderId=${response.data.orderId}`);
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Failed to process checkout. Please try again.');
    }
  };

  if (isLoading) {
    return <Spinner label="Loading checkout..." />;
  }

  if (error) {
    return <Text style={{ color: 'red' }}>{error}</Text>;
  }

  return (
    <Stack tokens={{ childrenGap: 20 }} id={id}>
      <Text variant="xxLarge">Checkout</Text>
      {basketData && (
        <Text variant="large">Total Amount: ${basketData.total.toFixed(2)}</Text>
      )}
      <form onSubmit={handleSubmit}>
        <Stack tokens={{ childrenGap: 15 }}>
          <TextField label="Name" name="name" value={formData.name} onChange={handleChange as ITextFieldProps['onChange']} required />
          <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange as ITextFieldProps['onChange']} required />
          <TextField label="Address" name="address" value={formData.address} onChange={handleChange as ITextFieldProps['onChange']} required multiline rows={3} />
          <PrimaryButton text="Place Order" type="submit" disabled={!basketData || basketData.items.length === 0} />
        </Stack>
      </form>
    </Stack>
  );
};

export default Checkout;