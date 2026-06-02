export type CartItem = {
    productId: number;
    storeSlug: string;
    productSlug: string;
    name: string;
    price: number;
    imageUrl: string | null;
    quantity: number;
  };
  
  function getCartKey(storeSlug: string) {
    return `umkm_saas_cart_${storeSlug}`;
  }
  
  export function getCartItems(storeSlug: string): CartItem[] {
    if (typeof window === "undefined") {
      return [];
    }
  
    const rawCart = localStorage.getItem(getCartKey(storeSlug));
  
    if (!rawCart) {
      return [];
    }
  
    try {
      return JSON.parse(rawCart) as CartItem[];
    } catch {
      return [];
    }
  }
  
  export function saveCartItems(storeSlug: string, items: CartItem[]) {
    localStorage.setItem(getCartKey(storeSlug), JSON.stringify(items));
  }
  
  export function addCartItem(
    storeSlug: string,
    item: Omit<CartItem, "quantity">,
  ) {
    const currentItems = getCartItems(storeSlug);
  
    const existingItem = currentItems.find(
      (cartItem) => cartItem.productId === item.productId,
    );
  
    if (existingItem) {
      const updatedItems = currentItems.map((cartItem) =>
        cartItem.productId === item.productId
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
            }
          : cartItem,
      );
  
      saveCartItems(storeSlug, updatedItems);
      return updatedItems;
    }
  
    const updatedItems = [
      ...currentItems,
      {
        ...item,
        quantity: 1,
      },
    ];
  
    saveCartItems(storeSlug, updatedItems);
    return updatedItems;
  }
  
  export function updateCartItemQuantity(
    storeSlug: string,
    productId: number,
    quantity: number,
  ) {
    const currentItems = getCartItems(storeSlug);
  
    const updatedItems = currentItems
      .map((cartItem) =>
        cartItem.productId === productId
          ? {
              ...cartItem,
              quantity,
            }
          : cartItem,
      )
      .filter((cartItem) => cartItem.quantity > 0);
  
    saveCartItems(storeSlug, updatedItems);
    return updatedItems;
  }
  
  export function removeCartItem(storeSlug: string, productId: number) {
    const currentItems = getCartItems(storeSlug);
  
    const updatedItems = currentItems.filter(
      (cartItem) => cartItem.productId !== productId,
    );
  
    saveCartItems(storeSlug, updatedItems);
    return updatedItems;
  }
  
  export function clearCart(storeSlug: string) {
    localStorage.removeItem(getCartKey(storeSlug));
  }
  
  export function getCartTotal(items: CartItem[]) {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }