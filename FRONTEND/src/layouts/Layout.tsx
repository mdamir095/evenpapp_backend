import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./dashboardHeader";
import Sidebar from "./sidebar";
// import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

const layoutVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
const slideVariants = {
  hidden: { opacity: 0, x: 100 },     // Slide in from right
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },      // Slide out to left
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Initialize sidebar state from localStorage or default to true
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  // URLs that should have minimized sidebar
  const minimizedSidebarRoutes = [
    '/form-list',
    '/form-builder'
  ];

  // Check if current route should have minimized sidebar
  const shouldMinimizeSidebar = () => {
    const currentPath = location.pathname;
    
    // Check for exact matches
    if (minimizedSidebarRoutes.includes(currentPath)) {
      return true;
    }
    
    // Check for form-builder with query parameters (like ?id=...)
    if (currentPath === '/form-builder' && location.search) {
      return true;
    }
    
    return false;
  };

  // Auto-minimize sidebar based on current route
  useEffect(() => {
    if (shouldMinimizeSidebar()) {
      setIsExpanded(false);
    } else {
      // Restore to expanded state when leaving FormBuilder routes
      setIsExpanded(true);
    }
  }, [location.pathname, location.search]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  return (
    // <motion.div
    //   initial="hidden"
    //   animate="visible"
    //   exit="exit"
    //   variants={slideVariants}
    //   transition={{ duration: 0.4, ease: "easeOut" }}
    //   className="min-h-screen bg-gray-100"
    // >
    //    </motion.div>
    <div className="min-h-screen grid">
          <div className="flex h-screen bg-neutral-100">
            <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
            <main
              className={`bg-dashboardMain text-gray-800 w-full transition-all duration-300 grid grid-rows-[auto_1fr] overflow-hidden 
               ${isExpanded ? "ml-65" : "ml-16" }
             `}
            //  <main
            //   className={`bg-dashboardMain text-gray-800 w-full transition-all duration-300 grid grid-rows-[auto_1fr] overflow-hidden 
            //     ${isExpanded ? "ml-85" : "ml-20" }
            //  `}
            >
              <Header />
              <div className="overflow-y-auto p-6 text-gray-800 mt-[71.2px] ">
                {children}
              </div>
            </main>
          </div>
        </div>
   
    
  );
};

export default Layout;
