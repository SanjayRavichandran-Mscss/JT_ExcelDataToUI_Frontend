// import React from 'react'
// import CreateNewSheet from '../components/CreateNewSheet'
// import ViewSheets from '../components/ViewSheets'
// import CreateRecords from '../components/CreateRecords'
// const Home = () => {
//   return (
//     <>
// <CreateNewSheet />
// <ViewSheets />
// <CreateRecords /> 
//     </>
//   )
// }

// export default Home








import React, { useState } from "react";
import CreateNewSheet from "../components/CreateNewSheet";
import ViewSheets from "../components/ViewSheets";
import CreateRecords from "../components/CreateRecords";

const Home = () => {
  const [activeTab, setActiveTab] = useState("createRecords");

  const menuItems = [
    { id: "createRecords", label: "Create Records" },
    { id: "createSheet", label: "Create New Sheet" },
    { id: "viewSheets", label: "View Sheets" },
  ];

  const renderComponent = () => {
    switch (activeTab) {
      case "createRecords":
        return <CreateRecords />;
      case "createSheet":
        return <CreateNewSheet />;
      case "viewSheets":
        return <ViewSheets />;
      default:
        return <CreateRecords />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative w-full text-left px-4 py-3 rounded-md transition-all duration-300 cursor-pointer
                ${
                  activeTab === item.id
                    ? "text-indigo-600 font-semibold"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
            >
              {item.label}

              <span
                className={`absolute left-4 bottom-1 h-[2px] bg-indigo-600 transition-all duration-300
                ${
                  activeTab === item.id
                    ? "w-12"
                    : "w-0 group-hover:w-8"
                }`}
              />
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {renderComponent()}
      </main>
    </div>
  );
};

export default Home;