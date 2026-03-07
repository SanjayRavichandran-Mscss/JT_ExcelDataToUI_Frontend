// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import Login from "./components/Login";
// import Home from "./pages/Home";

// import CreateRecords from "./components/CreateRecords";
// import CreateNewSheet from "./components/CreateNewSheet";
// import ViewSheets from "./components/ViewSheets";
// import RecordsLimitValues from "./components/RecordsLimitValues";

// import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* Public Route */}
//         <Route path="/login" element={<Login />} />

//         {/* Redirect root */}
//         <Route path="/" element={<Navigate to="/login" replace />} />

//         {/* Protected Routes */}
//         <Route element={<ProtectedRoute />}>
          
//           {/* Home Layout */}
//           <Route path="/home" element={<Home />}>

//             {/* Default tab */}
//             <Route index element={<Navigate to="create-records" replace />} />

//             <Route path="create-records" element={<CreateRecords />} />
//             <Route path="create-sheet" element={<CreateNewSheet />} />
//             <Route path="view-sheets" element={<ViewSheets />} />
//             <Route path="set-record-limit" element={<RecordsLimitValues />} />

//           </Route>

//         </Route>

//         {/* Catch invalid routes */}
//         <Route path="*" element={<Navigate to="/login" replace />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;













import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Home from "./pages/Home";

import CreateRecords from "./components/CreateRecords";
import CreateNewSheet from "./components/CreateNewSheet";
import ViewSheets from "./components/ViewSheets";
import RecordsLimitValues from "./components/RecordsLimitValues";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login page */}
        <Route path="/" element={<Login />} />

        {/* Protected layout */}
        <Route element={<ProtectedRoute />}>

          <Route element={<Home />}>

            <Route path="/create-records" element={<CreateRecords />} />
            <Route path="/create-sheet" element={<CreateNewSheet />} />
            <Route path="/view-sheets" element={<ViewSheets />} />
            <Route path="/set-record-limit" element={<RecordsLimitValues />} />

          </Route>

        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;