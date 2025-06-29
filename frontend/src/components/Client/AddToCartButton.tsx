/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShoppingBag } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { addToCart } from "@/api/cart.api";
import type { Product } from "@/types/Product/product";
import { useUser } from "@/contexts/userContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useCart } from "@/contexts/cartContext";

export default function AddToCartButton({
  product,
  quantity,
  setQuantity,
  end_stock,
}: {
  product: Product;
  quantity: number;
  end_stock: number;
  setQuantity?: any;
}) {
  const { cartData } = useCart();
  const { userProfile } = useUser();
  const { setCartChanged } = useCart();
  const cartQuantity =
    cartData?.cart_details?.find(
      (item) => item.product_id === product.product_id
    )?.quantity ?? 0;

  const mutation = useMutation({
    mutationFn: (productId: string) => addToCart(productId, quantity),
    onSuccess: () => {
      setCartChanged(true);
      toast.success("Sản phẩm đã được thêm vào giỏ hàng", { autoClose: 1500 });
      if (setQuantity) setQuantity(1);
    },
    onError: (error) => {
      const err = error as any;
      toast.error(
        err?.response?.data?.message ||
          `Có lỗi xảy ra khi thêm sản phẩm vào giỏ hảng.`
      );
      console.log(error);
    },
  });

  const nav = useNavigate();

  const handleAddToCart = () => {
    if (!userProfile?.user_id) {
      nav("/auth");
    }
    mutation.mutate(product.product_id);
  };

  return (
    <button
      className={`flex w-full items-center disabled:cursor-not-allowed justify-center gap-2 bg-primary border border-primary text-white px-5 py-2.5 font-bold hover:text-white hover:bg-primary/80 hover:border hover:border-primary/80 transition-all duration-300 text:md cursor-pointer disabled:bg-primary/50 disabled:border-primary/50`}
      onClick={handleAddToCart}
      disabled={
        mutation.isPending ||
        end_stock == 0 ||
        quantity + cartQuantity > end_stock
      }
    >
      <ShoppingBag size={18} />
      {mutation.isPending ? "ĐANG THÊM..." : "THÊM VÀO GIỎ"}
    </button>
  );
}
