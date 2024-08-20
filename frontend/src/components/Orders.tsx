// src/components/Orders.tsx
import React, { useState, useEffect } from 'react';
import { Stack, Text, SearchBox, DetailsList, IColumn, SelectionMode, Spinner } from '@fluentui/react';
import axios from 'axios';

interface Order {
  id: number;
  user_id: number;
  name: string;
  order_date: string;
  total_amount: number;
  status: string;
}

interface OrdersProps {
  id?: string;
}

const Orders: React.FC<OrdersProps> = ({ id }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Order[]>('http://localhost:3002/api/orders');
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchText: string) => {
    const filtered = orders.filter(order => 
      order.id.toString().includes(searchText) ||
      order.user_id.toString().includes(searchText) ||
      order.name.toLowerCase().includes(searchText.toLowerCase()) ||
      order.order_date.includes(searchText) ||
      order.status.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const columns: IColumn[] = [
    { key: 'id', name: 'Order ID', fieldName: 'id', minWidth: 50, maxWidth: 100, isResizable: true },
    { key: 'userId', name: 'User ID', fieldName: 'user_id', minWidth: 50, maxWidth: 100, isResizable: true },
    { key: 'userName', name: 'User Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'date', name: 'Date', fieldName: 'order_date', minWidth: 100, maxWidth: 200, isResizable: true },
   { key: 'total', name: 'Total', fieldName: 'total_amount', minWidth: 70, maxWidth: 100, isResizable: true, 
      onRender: (item: Order) => `$${item.total_amount.toFixed(2)}` },
    { key: 'status', name: 'Status', fieldName: 'status', minWidth: 70, maxWidth: 100, isResizable: true },
  ];

  if (isLoading) {
    return <Spinner label="Loading orders..." />;
  }

  if (error) {
    return <Text style={{ color: 'red' }}>{error}</Text>;
  }

  return (
    <Stack tokens={{ childrenGap: 20 }} id={id}>
      <Text variant="xxLarge">All Orders</Text>
      <SearchBox placeholder="Search orders" onChange={(_, newValue) => handleSearch(newValue || '')} />
      <DetailsList
        items={filteredOrders}
        columns={columns}
        setKey="set"
        layoutMode={1}
        selectionMode={SelectionMode.none}
      />
    </Stack>
  );
};

export default Orders;