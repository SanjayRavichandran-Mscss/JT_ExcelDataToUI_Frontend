// import React, { useState } from "react";
// import CreateNewSheet from "../components/CreateNewSheet";
// import ViewSheets from "../components/ViewSheets";
// import CreateRecords from "../components/CreateRecords";
// import RecordsLimitValues from "../components/RecordsLimitValues"; // ← added this import

// const Home = () => {
//   const [activeTab, setActiveTab] = useState("createRecords");

//   const menuItems = [
//     { id: "createRecords",    label: "Create Records" },
//     { id: "createSheet",      label: "Create New Sheet" },
//     { id: "viewSheets",       label: "View Sheets" },
//     { id: "setRecordLimit",   label: "Set Record Limit" },   // ← new tab
//   ];

//   const renderComponent = () => {
//     switch (activeTab) {
//       case "createRecords":
//         return <CreateRecords />;
//       case "createSheet":
//         return <CreateNewSheet />;
//       case "viewSheets":
//         return <ViewSheets />;
//       case "setRecordLimit":               // ← new case
//         return <RecordsLimitValues />;
//       default:
//         return <CreateRecords />;
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-slate-100">
//       {/* Top Navigation Bar */}
//       <header className="bg-white shadow">
//         <div className="px-6 py-4 flex items-center justify-between border-b">
//           <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          
//           {/* Tabs */}
//           <nav className="flex space-x-1">
//             {menuItems.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => setActiveTab(item.id)}
//                 className={`
//                   relative px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200
//                   ${
//                     activeTab === item.id
//                       ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
//                       : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
//                   }
//                 `}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 p-6 overflow-y-auto">
//         {renderComponent()}
//       </main>
//     </div>
//   );
// };

// export default Home;














import React from "react";
import { Outlet } from "react-router-dom";
import Menus from "../components/Menus";

const Home = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-100">

      <Menus />

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default Home;