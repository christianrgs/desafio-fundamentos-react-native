import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:cartProducts',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const addedProductIndex = products.findIndex(
        addedProduct => addedProduct.id === product.id,
      );

      let newProducts;

      if (addedProductIndex !== -1) {
        products[addedProductIndex].quantity += 1;

        newProducts = products;
      }

      newProducts = [...products, { ...product, quantity: 1 }];

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cartProducts',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(addedProduct => {
        if (addedProduct.id === id) {
          return { ...addedProduct, quantity: addedProduct.quantity + 1 };
        }

        return addedProduct;
      });

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cartProducts',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(addedProduct => {
        if (addedProduct.id === id) {
          const newQuantity = addedProduct.quantity - 1;

          return {
            ...addedProduct,
            quantity: newQuantity > 0 ? newQuantity : 1,
          };
        }

        return addedProduct;
      });

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cartProducts',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
