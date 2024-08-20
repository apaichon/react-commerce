// src/components/ConfirmPayment.tsx
import React, { useState, useEffect } from 'react';
import { Stack, Text, PrimaryButton, Spinner, DetailsList, IColumn } from '@fluentui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

interface ConfirmPaymentProps {
  userId: number;
  id?: string;
}

interface OrderDetails {
  orderId: number;
  items: OrderItem[];
  total: number;
  status: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

const ConfirmPayment: React.FC<ConfirmPaymentProps> = ({ userId, id }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');
    if (orderId) {
      fetchOrderDetails(parseInt(orderId, 10));
    } else {
      setError('No order ID provided. Please try again.');
      setIsLoading(false);
    }
  }, [location]);

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setIsLoading(true);
      const response = await axios.get<OrderDetails>(`http://localhost:3002/api/orders/${orderId}`);
      setOrderDetails(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderDetails) return;

    try {
      setIsLoading(true);
      await axios.post('http://localhost:3002/api/confirm-payment', { 
        orderId: orderDetails.orderId
      });
      alert('Payment confirmed!');
      navigate('/');
    } catch (error) {
      console.error('Error confirming payment:', error);
      setError('Failed to confirm payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: IColumn[] = [
    { key: 'name', name: 'Product', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'quantity', name: 'Quantity', fieldName: 'quantity', minWidth: 50, maxWidth: 100, isResizable: true },
    { key: 'price', name: 'Price', fieldName: 'price', minWidth: 50, maxWidth: 100, isResizable: true, onRender: (item: OrderItem) => `$${(item.price * item.quantity).toFixed(2)}` },
  ];

  if (isLoading) {
    return <Spinner label="Loading order details..." />;
  }

  if (error) {
    return (
      <Stack tokens={{ childrenGap: 20 }} id={id}>
        <Text variant="large" style={{ color: 'red' }}>{error}</Text>
        <PrimaryButton text="Go to Home" onClick={() => navigate('/')} />
      </Stack>
    );
  }

  return (
    <Stack tokens={{ childrenGap: 20 }} id={id}>
      <Text variant="xxLarge">Confirm Payment</Text>
      {orderDetails && (
        <>
          <Text variant="large">Order Summary:</Text>
          <DetailsList
            items={orderDetails.items}
            columns={columns}
            setKey="set"
            layoutMode={1}
            selectionMode={0}
          />
          <Stack horizontal horizontalAlign="space-between">
            <Text variant="large">Total:</Text>
            <Text variant="large">${orderDetails.total.toFixed(2)}</Text>
          </Stack>
          <Text>Order Status: {orderDetails.status}</Text>
          <Text>Please confirm your payment to complete the transaction.</Text>
          <PrimaryButton 
            text="Confirm Payment" 
            onClick={handleConfirmPayment} 
            disabled={isLoading || orderDetails.status !== 'pending'} 
          />
        </>
      )}
    </Stack>
  );
};

export default ConfirmPayment;