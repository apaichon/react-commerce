// src/components/Header.tsx
import React from 'react';
import { Stack, Text, CommandBar, ICommandBarItemProps, DefaultButton } from '@fluentui/react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  userId: number;
  onChangeUser: () => void;
}

const Header: React.FC<HeaderProps> = ({ userId, onChangeUser }) => {
  const location = useLocation();

  const items: ICommandBarItemProps[] = [
    {
      key: 'home',
      text: 'Home',
      iconProps: { iconName: 'Home' },
      href: '/',
    },
    {
      key: 'basket',
      text: 'Basket',
      iconProps: { iconName: 'ShoppingCart' },
      href: '/basket',
    },
    {
      key: 'orders',
      text: 'Orders',
      iconProps: { iconName: 'AllApps' },
      href: '/orders',
    },
  ];

  return (
    <Stack>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" padding={10}>
        <Text variant="xxLarge">Your Ecommerce App</Text>
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <Text id="txtUserId" data-automated-value={userId}>User ID: {userId}</Text>
          {location.pathname === '/' && (
            <DefaultButton text="Change User" onClick={onChangeUser} />
          )}
        </Stack>
      </Stack>
      <CommandBar items={items} />
    </Stack>
  );
};

export default Header;