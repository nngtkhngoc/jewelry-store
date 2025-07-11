import { Link } from "react-router";

export default function Newsletter() {
  return (
    <section className="text-center bg-primary/20 py-10 px-5 mt-20 flex flex-col gap-3 justify-center items-center">
      <h2 className="text-xl font-bold ">Đăng ký ngay để nhận các ưu đãi</h2>
      <p className="mb-4">
        Đăng ký nhận ưu đãi và cập nhật mới nhất từ cửa hàng
      </p>
      <Link
        to="/auth"
        className="px-4 py-2 bg-primary text-white rounded-r hover:bg-primary/50 transition-all duration-500"
      >
        Đăng ký
      </Link>
    </section>
  );
}
