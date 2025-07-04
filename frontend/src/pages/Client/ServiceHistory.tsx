import { useUser } from "@/contexts/userContext";
import { HistoryIcon } from "lucide-react";
import ServiceHistoryCard from "../../components/Client/ServiceHistoryCard";
import SkeletonServiceHistoryCard from "../../components/Client/SkeletonServiceHistoryCard";

function ServiceHistory() {
  const { userProfile, isLoading } = useUser();

  const serviceOrders = userProfile?.service_orders;
  if (!serviceOrders?.length && !isLoading) {
    return (
      <div className="py-6 border border-card-border rounded-lg max-w-[1000px] mx-auto bg-white p-8 text-center">
        <p className="text-gray-600">Không có đơn dịch vụ nào</p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-[1000px] mx-auto min-h-dvh">
      <div className="flex justify-center items-center gap-2 px-6 py-4">
        <HistoryIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl uppercase font-bold text-gray-800">
          Lịch sử dịch vụ
        </h2>
      </div>
      <div className="px-10 mt-6">
        <ul className="space-y-6">
          {isLoading
            ? [...Array(2)].map((_, idx) => (
                <li key={idx}>
                  <SkeletonServiceHistoryCard />
                </li>
              ))
            : serviceOrders?.map((order) => (
                <li key={order.service_order_id}>
                  <ServiceHistoryCard
                    createdAt={order.created_at}
                    orderId={order.service_order_id}
                    details={order.service_order_details}
                    total_price={order.total_price}
                  />
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
}

export default ServiceHistory;
