import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Package,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import type { SupplierResponse } from "@/types/supplier/supplier";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
} from "@/api/supplier.api";
// import { useNotification } from "@/contexts/notificationContext";
import { Pagination } from "antd";
import { exportToExcel } from "@/utility/exportToExcel";

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const [deleting, setDeleting] = useState<SupplierResponse>(
    {} as unknown as SupplierResponse
  );
  const [editingSupplier, setEditingSupplier] = useState<SupplierResponse>(
    {} as unknown as SupplierResponse
  );

  const limit = 5;

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page, limit],
    queryFn: () => getAllSuppliers({ page, limit }),
  });

  const suppliersData = data?.data;
  const totalItems = data?.totalItems;
  const totalPages = data?.totalPages;

  if (page < totalPages)
    queryClient.prefetchQuery({
      queryKey: ["suppliers", page + 1, limit],
      queryFn: () => getAllSuppliers({ page: page + 1, limit }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["suppliers", page - 1, limit],
      queryFn: () => getAllSuppliers({ page: page - 1, limit }),
    });

  const filteredSuppliers = suppliersData?.filter(
    (supplier: { name: string; phone_number: string; address: string }) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: SupplierResponse) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingSupplier({} as unknown as SupplierResponse);
    setShowModal(true);
  };

  const handleDelete = (supplier: SupplierResponse) => {
    setDeleting(supplier);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
          <p className="text-gray-600">
            Quản lý thông tin và mối quan hệ với nhà cung cấp
          </p>
        </div>

        <div className="flex flex-row gap-3">
          <button
            onClick={handleAdd}
            className="flex cursor-pointer items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhà cung cấp
          </button>

          <button
            onClick={() =>
              exportToExcel(filteredSuppliers ?? [], `Danh sách nhà cung cấp`)
            }
            className="flex cursor-pointer items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhà cung cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                filteredSuppliers?.map((supplier: SupplierResponse) => (
                  <tr
                    key={supplier.supplier_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {supplier.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {supplier.address.split(",")[0]}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {supplier.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        {/* REFERENCE LATER */}
                        {supplier?.products?.length} sản phẩm
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                        >
                          <Edit2 className="h-4 w-4 cursor-pointer" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                        >
                          <Trash2 className="h-4 w-4 cursor-pointer" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        align="center"
        current={page}
        total={totalItems || 0}
        pageSize={5}
        onChange={(current) => {
          setPage(current);
        }}
      />

      {/* Modal */}
      {showModal && (
        <SupplierModal
          supplierData={editingSupplier}
          setShowModal={setShowModal}
        />
      )}

      {/* Confirm delete */}
      {deleting.supplier_id && (
        <ConfirmModal deleting={deleting} setDeleting={setDeleting} />
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-6 py-5 whitespace-nowrap">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="flex items-center">
                <div className="h-3 w-3 mr-1 bg-gray-200 rounded"></div>
                <div className="h-3 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-3 w-3 mr-1 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-4 w-4 mr-2 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

type Supplier = {
  name: string;
  phone_number: string;
  address: string;
};

function SupplierModal({
  supplierData,
  setShowModal,
}: {
  supplierData: SupplierResponse;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [supplier, setSupplier] = useState({
    name: supplierData.name,
    address: supplierData.address,
    phone_number: supplierData.phone_number,
  });

  const queryClient = useQueryClient();
  // const { addNotification } = useNotification();
  const { mutate, isPending } = useMutation({
    mutationFn: supplierData.supplier_id
      ? (data: Supplier) => updateSupplier(supplierData.supplier_id, data)
      : (data: Supplier) => createSupplier(data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });
      toast.success(
        supplierData.supplier_id ? "Cập nhật thành công" : "Tạo thành công"
      );
      setShowModal(false);
    },
    onError(error: AxiosError) {
      const serverErr = error.response?.data as unknown as {
        message: string[];
      };
      const msg =
        error.status === 400
          ? `Dữ liệu không thỏa mãn: ${serverErr.message.join(". ")}`
          : "";
      toast.error(
        msg ||
          `Lỗi khi ${
            supplierData.supplier_id ? "cập nhật" : "tạo"
          } Nhà cung cấp: ${error.message}`
      );
    },
  });

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!supplier.name || !supplier.address || !supplier.phone_number) return;
    mutate(supplier);
  };

  return (
    <div className="fixed inset-0 bg-gray-600/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 cursor-pointer">
            {supplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
          </h2>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhà cung cấp
              </label>
              <input
                disabled={isPending}
                type="text"
                required
                defaultValue={supplier?.name || ""}
                onChange={(e) =>
                  setSupplier({ ...supplier, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên nhà cung cấp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                required
                disabled={isPending}
                defaultValue={supplier?.phone_number || ""}
                onChange={(e) =>
                  setSupplier({ ...supplier, phone_number: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <textarea
                rows={3}
                required
                disabled={isPending}
                defaultValue={supplier?.address || ""}
                onChange={(e) =>
                  setSupplier({ ...supplier, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập địa chỉ đầy đủ"
              />
            </div>
          </form>
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 cursor-pointer disabled:cursor-not-allowed bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600"
            >
              {isPending
                ? "Đang cập nhật..."
                : supplierData.supplier_id
                ? "Cập nhật"
                : "Tạo mới"}{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  deleting,
  setDeleting,
}: {
  deleting: SupplierResponse;
  setDeleting: React.Dispatch<React.SetStateAction<SupplierResponse>>;
}) {
  const queryClient = useQueryClient();
  // const { addNotification } = useNotification();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteSupplier,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });
      toast.success("Xóa thành công");
      setDeleting({} as unknown as SupplierResponse);
    },
    onError(error) {
      toast.error(`Lỗi khi xóa Nhà cung cấp: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    mutate(deleting.supplier_id);
  };

  return (
    <div className="fixed inset-0 bg-gray-600/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bạn chắc chắn muốn xóa Nhà cung cấp <b>{deleting.name}</b>?
          </h2>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={() => setDeleting({} as unknown as SupplierResponse)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 disabled:cursor-not-allowed cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:bg-gray-600"
            >
              {isPending ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
