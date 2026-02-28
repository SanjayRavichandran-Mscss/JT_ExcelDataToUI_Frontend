// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         navigate('/home');
//       } else {
//         setMessage(data.message || 'Login failed');
//       }
//     } catch (error) {
//       setMessage('Something went wrong. Please try again.');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     // ✅ Background changed to white
//     <div className="min-h-screen flex items-center justify-center bg-white px-4">
      
//       {/* FORM NOT TOUCHED */}
//       <div className="bg-gray-900/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-700/50">
//         <div className="text-center mb-10">
//           <h2 className="text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
//             Welcome Back
//           </h2>
//           <p className="text-gray-400 text-lg">Enter your credentials</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-8">
          
//           {/* Email */}
//           <div>
//             <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
//               Email Address
//             </label>
//             <div className="relative">
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="your.email@example.com"
//                 required
//                 className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-gray-600 text-white text-lg placeholder-gray-500 transition-all duration-500 ease-out outline-none peer"
//               />
//               <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out peer-focus:w-full" />
//             </div>
//           </div>

//           {/* Password */}
//           <div>
//             <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 required
//                 className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-gray-600 text-white text-lg placeholder-gray-500 transition-all duration-500 ease-out outline-none peer"
//               />
//               <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out peer-focus:w-full" />
//             </div>
//           </div>

//           {/* Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`group relative w-full py-4 px-8 font-bold text-lg rounded-2xl transition-all duration-300 overflow-hidden
//               ${
//                 loading
//                   ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-white to-gray-100 text-gray-900 hover:from-gray-100 hover:to-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
//               }`}
//           >
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>

//         {message && (
//           <div className="mt-8 p-4 rounded-2xl border text-center text-sm font-semibold">
//             {message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;












import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ────────────────────────────────────────
        //  MOST IMPORTANT PART – save the token!
        // ────────────────────────────────────────
        localStorage.setItem('token', data.token);           // ← usually backend sends token
        // localStorage.setItem('user', JSON.stringify(data.user));  // optional

        navigate('/home', { replace: true });   // replace: true → better UX (no back to login)
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-gray-900/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-700/50">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-lg">Enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-gray-600 text-white text-lg placeholder-gray-500 transition-all duration-500 ease-out outline-none peer"
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out peer-focus:w-full" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-gray-600 text-white text-lg placeholder-gray-500 transition-all duration-500 ease-out outline-none peer"
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out peer-focus:w-full" />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full py-4 px-8 font-bold text-lg rounded-2xl transition-all duration-300 overflow-hidden
              ${loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-white to-gray-100 text-gray-900 hover:from-gray-100 hover:to-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {message && (
          <div className={`mt-8 p-4 rounded-2xl border text-center text-sm font-semibold ${
            message.includes('failed') || message.includes('wrong')
              ? 'bg-red-950/50 border-red-700/50 text-red-300'
              : 'bg-green-950/50 border-green-700/50 text-green-300'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;