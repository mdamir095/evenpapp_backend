import { useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group"; // Optional, for smoother transitions
import { Button } from "./Button";

const tabs = ["Overview", "Projects", "Settings"];

export default function Tabs() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const getContent = (tab: string) => {
    switch (tab) {
      case "Overview": return <div>Overview content</div>;
      case "Projects": return <div>Projects content</div>;
      case "Settings": return <div>Settings content</div>;
    }
  };

  return (
    <div className="">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-300 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold transition-colors duration-300  w-50 ${
              activeTab === tab
                ? "border-b-0 border-0 text-blue-600 hover:text-bg-blue-100 focus:ring-offset-0"
                : "text-Neutral-500 hover:bg-blue-50 hover:text-bg-blue-100 focus:ring-offset-0 focus:ring-blue-500 focus:ring-4px"
            }`}
          >
            {tab}
            <span className="text-blue-600 slide"></span>
          </button>
        ))}
      </div>

      {/* Tab Panel with Animation */}
      <div className="relative overflow-hidden min-h-[100px]">
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={activeTab}
            classNames={{
              enter: "opacity-0 translate-x-4",
              enterActive: "opacity-100 translate-x-0 transition-all duration-300",
              exit: "opacity-100 translate-x-0",
              exitActive: "opacity-0 translate-x-4 transition-all duration-300",
            }}
            timeout={300}
          >
            <div className="absolute w-full">
              {getContent(activeTab)}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
}
