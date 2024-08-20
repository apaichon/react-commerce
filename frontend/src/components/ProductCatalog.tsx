// src/components/ProductCatalog.tsx
import React, { useState, useEffect } from 'react';
import { Stack, Text, PrimaryButton, Image, ImageFit } from '@fluentui/react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface ProductCatalogProps {
  userId: number;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ userId }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get<Product[]>('http://localhost:3002/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const addToBasket = (productId: number) => {
    axios.post('http://localhost:3002/api/basket', { userId, productId, quantity: 1 })
      .then(() => alert('Product added to basket'))
      .catch(error => console.error('Error adding to basket:', error));
  };

  return (
    <Stack tokens={{ childrenGap: 20 }}>
      <Text variant="xxLarge">Product Catalog</Text>
      <Stack horizontal wrap tokens={{ childrenGap: 20 }}>
        {products.map(product => (
          <Stack key={product.id} styles={{ root: { width: 200, padding: 10, boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px' } }}>
            <Image src={`images/${product.imageUrl}`} imageFit={ImageFit.cover} width={200} height={150} />
            <Text variant="large">{product.name}</Text>
            <Text>${product.price.toFixed(2)}</Text>
            <PrimaryButton id="btnAddToBasket" text="Add to Basket" onClick={() => addToBasket(product.id)} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default ProductCatalog;