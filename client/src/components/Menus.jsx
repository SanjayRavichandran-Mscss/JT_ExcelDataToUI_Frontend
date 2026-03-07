import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "./Assets/logo.png";

const Menus = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Create Records",
      path: "/create-records",
    },
    {
      label: "Create New Sheet",
      path: "/create-sheet",
    },
    {
      label: "View Sheets",
      path: "/view-sheets",
    },
    {
      label: "Set Record Limit",
      path: "/set-record-limit",
    },
  ];

  const handleLogout = async () => {

    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Logout"
    });

    if (result.isConfirmed) {

      localStorage.removeItem("token");

      await Swal.fire({
        icon: "success",
        title: "Logged out",
        timer: 1200,
        showConfirmButton: false
      });

      navigate("/", { replace: true });
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4 flex items-center border-b">

        {/* LEFT LOGO */}
        <div className="flex items-center w-1/4">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-10 object-contain cursor-pointer"
            onClick={() => navigate("/create-records")}
          />
        </div>

        {/* CENTER MENUS */}
        <nav className="flex justify-center flex-1 space-x-1">

          {menuItems.map((item) => {

            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  relative px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200
                  ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}

        </nav>

        {/* RIGHT LOGOUT */}
        <div className="flex justify-end w-1/4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

      </div>
    </header>
  );
};

export default Menus;