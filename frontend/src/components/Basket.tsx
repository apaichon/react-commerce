// src/components/Basket.tsx
import React, { useState, useEffect } from 'react';
import { Stack, Text, PrimaryButton, DefaultButton, DetailsList, IColumn, Dialog, DialogType, DialogFooter } from '@fluentui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface BasketItem {
  basket_item_id: number;
  name: string;
  quantity: number;
  price: number;
}

interface BasketData {
  items: BasketItem[];
  total: number;
}

interface BasketProps {
  userId: number;
}

const Basket: React.FC<BasketProps> = ({ userId }) => {
  const [basketData, setBasketData] = useState<BasketData>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogHidden, setIsDialogHidden] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchBasket();
  }, [userId]);

  const clearBasket = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:3002/api/basket/${userId}`);
      setBasketData({ items: [], total: 0 });
      setIsDialogHidden(true);
    } catch (error) {
      console.error('Error clearing basket:', error);
      setError('Failed to clear basket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: IColumn[] = [
    { key: 'name', name: 'Product', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'quantity', name: 'Quantity', fieldName: 'quantity', minWidth: 50, maxWidth: 100, isResizable: true },
    { key: 'price', name: 'Price', fieldName: 'price', minWidth: 50, maxWidth: 100, isResizable: true, onRender: (item: BasketItem) => `$${(item.price * item.quantity).toFixed(2)}` },
  ];

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge">Your Basket</Text>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <DetailsList
        items={basketData.items}
        columns={columns}
        setKey="set"
        layoutMode={1}
        selectionMode={0}
      />
      <Stack horizontal horizontalAlign="space-between">
        <Text variant="xLarge">Total:</Text>
        <Text variant="xLarge">${basketData.total.toFixed(2)}</Text>
      </Stack>
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton 
          text="Proceed to Checkout" 
          onClick={() => navigate('/checkout')}
          disabled={basketData.items.length === 0 || isLoading}
        />
        <DefaultButton 
          text="Clear Basket" 
          onClick={() => setIsDialogHidden(false)}
          disabled={basketData.items.length === 0 || isLoading}
        />
      </Stack>
      <Dialog
        hidden={isDialogHidden}
        onDismiss={() => setIsDialogHidden(true)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Clear Basket',
          subText: 'Are you sure you want to remove all items from your basket?'
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={clearBasket} text="Yes, clear basket" />
          <DefaultButton onClick={() => setIsDialogHidden(true)} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};

export default Basket;