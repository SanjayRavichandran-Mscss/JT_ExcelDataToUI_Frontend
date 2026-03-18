// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "./Assets/logo.png";

// const Login = () => {

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   // If already logged in → go to home
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       navigate("/home/create-records", { replace: true });
//     }
//   }, [navigate]);

//   const handleSubmit = async (e) => {

//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     try {

//       const response = await fetch("http://103.118.158.113.188:5000/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email,
//           password,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {

//         // Save JWT token
//         localStorage.setItem("token", data.token);

//         // Redirect
//         navigate("/home/create-records", { replace: true });

//       } else {
//         setMessage(data.message || "Invalid email or password");
//       }

//     } catch (error) {
//       console.error("Login error:", error);
//       setMessage("Server error. Please try again.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">

//       <div className="w-full max-w-md">

//         {/* Logo */}
//         <div className="text-center mb-10">

//           <div className="inline-block p-2 border-2 border-gray-200 rounded-xl mb-6 shadow-sm bg-white">
//             <img
//               src={logo}
//               alt="Company Logo"
//               className="h-16 w-16 object-contain"
//               onError={(e) => {
//                 e.target.src = "https://via.placeholder.com/64?text=Logo";
//               }}
//             />
//           </div>

//           <h2 className="text-3xl font-bold text-gray-900">
//             Sign in to your account
//           </h2>

//           <p className="mt-3 text-gray-600">
//             Enter your credentials to access the dashboard
//           </p>

//         </div>

//         {/* Card */}
//         <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">

//           <form onSubmit={handleSubmit} className="space-y-7">

//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email address
//               </label>

//               <input
//                 type="email"
//                 required
//                 placeholder="name@company.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>

//               <input
//                 type="password"
//                 required
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//               />
//             </div>

//             {/* Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full py-3 rounded-xl font-semibold text-white transition
//                 ${
//                   loading
//                     ? "bg-indigo-400"
//                     : "bg-indigo-600 hover:bg-indigo-700"
//                 }
//               `}
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>

//           </form>

//           {/* Message */}
//           {message && (
//             <div className="mt-6 p-4 rounded-xl text-center text-sm bg-red-50 text-red-700 border border-red-200">
//               {message}
//             </div>
//           )}

//         </div>

//         {/* Footer */}
//         <div className="mt-8 text-center text-sm text-gray-500">
//           © {new Date().getFullYear()} Your Company
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Login;





















import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import logo from "./Assets/logo.png";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // If already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/create-records", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {

      const response = await fetch("http://103.118.158.113.188:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {

        localStorage.setItem("token", data.token);

        navigate("/create-records", { replace: true });

      } else {
        setMessage(data.message || "Login failed");
      }

    } catch (error) {
      console.error(error);
      setMessage("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">

          <div className="inline-block p-2 border-2 border-gray-200 rounded-xl mb-6 shadow-sm">
            <img
              src={logo}
              alt="Logo"
              className="h-16 w-16 object-contain"
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>

          <p className="mt-3 text-gray-600">
            Enter your credentials to access the dashboard
          </p>

        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition
              ${
                loading
                  ? "bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Error message */}
          {message && (
            <div className="mt-6 p-4 rounded-xl text-center text-sm bg-red-50 text-red-700 border border-red-200">
              {message}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Login;