
// "use client";

// import { useState } from "react";

// export default function PagePage() {
//     const [isDropdownOpen, setDropdownOpen] = useState(false); // State for Dropdown
//     const [isDropdownOpenRoutes, setDropdownOpenRoutes] = useState(false); // State for Dropdown
//     const [isSidebarOpen, setSidebarOpen] = useState(false); // State for Sidebar

//     const toggleDropdown = () => {
//         setDropdownOpen(!isDropdownOpen);
//     };

//     const toggleSidebar = () => {
//         setSidebarOpen(!isSidebarOpen);
//     };

//     const toggleDropdownRoutes = () => {
//         setDropdownOpenRoutes(!isDropdownOpenRoutes);
//     };


//     return (
//         <>
//             <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
//                 <div className="px-3 py-3 lg:px-5 lg:pl-3">
//                     <div className="flex items-center justify-between">
//                         {/* Left Section */}
//                         <div className="flex items-center justify-start rtl:justify-end">
//                             <button
//                                 onClick={toggleSidebar}
//                                 aria-controls="logo-sidebar"
//                                 type="button"
//                                 className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
//                             >
//                                 <span className="sr-only">Open sidebar</span>
//                                 <svg
//                                     className="w-6 h-6"
//                                     aria-hidden="true"
//                                     fill="currentColor"
//                                     viewBox="0 0 20 20"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                     <path
//                                         clipRule="evenodd"
//                                         fillRule="evenodd"
//                                         d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
//                                     ></path>
//                                 </svg>
//                             </button>
//                             <a href="#" className="flex ms-2 md:me-24">
//                                 <img
//                                     src="https://flowbite.com/docs/images/logo.svg"
//                                     className="h-8 me-3"
//                                     alt="FlowBite Logo"
//                                 />
//                                 <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
//                                     Flowbite
//                                 </span>
//                             </a>
//                         </div>

//                         {/* Right Section */}
//                         <div className="flex items-center">
//                             <div className="flex items-center ms-3">
//                                 <div>
//                                     <button
//                                         onClick={toggleDropdown}
//                                         type="button"
//                                         className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
//                                     >
//                                         <span className="sr-only">Open user menu</span>

//                                         <svg
//                                             aria-hidden="true"
//                                             xmlns="http://www.w3.org/2000/svg"
//                                             fill="currentColor"
//                                             viewBox="0 0 22 22"
//                                             className="w-8 h-8 rounded-full text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
//                                         >
//                                             <path d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812c.63-.63 1.16-1.37 1.58-2.18A9.72 9.72 0 0 1 20.25 12c0-5.078-4.172-9.25-9.25-9.25S1.75 6.922 1.75 12a9.72 9.72 0 0 1 1.81 4.062c.42.81.95 1.55 1.58 2.18Z" />
//                                         </svg>

//                                         {/* <img
//                       className="w-8 h-8 rounded-full"
//                       src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
//                       alt="user photo"
//                     /> */}
//                                     </button>
//                                 </div>
//                                 {/* Dropdown Menu */}
//                                 {isDropdownOpen && (
//                                     <div className="absolute right-5 top-5 mt-10 z-50 w-48 bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600">
//                                         <div className="px-4 py-3">
//                                             <p className="text-sm text-gray-900 dark:text-white">
//                                                 Neil Sims
//                                             </p>
//                                             <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300">
//                                                 neil.sims@flowbite.com
//                                             </p>
//                                         </div>
//                                         <ul className="py-1">
//                                             <li>
//                                                 <a
//                                                     href="#"
//                                                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
//                                                 >
//                                                     Dashboard
//                                                 </a>
//                                             </li>
//                                             <li>
//                                                 <a
//                                                     href="#"
//                                                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
//                                                 >
//                                                     Settings
//                                                 </a>
//                                             </li>
//                                             <li>
//                                                 <a
//                                                     href="#"
//                                                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
//                                                 >
//                                                     Sign out
//                                                 </a>
//                                             </li>
//                                         </ul>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </nav>

//             {/* Sidebar */}
//             <aside
//                 id="logo-sidebar"
//                 className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//                     } sm:translate-x-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}
//                 aria-label="Sidebar"
//             >
//                 <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
//                     <ul className="space-y-2 font-medium">
//                         <li>
//                             <button
//                                 type="button"
//                                 className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
//                                 onClick={toggleDropdownRoutes}
//                                 aria-expanded={isDropdownOpenRoutes}
//                             >
//                                 <svg
//                                     aria-hidden="true"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     fill="currentColor"
//                                     viewBox="0 0 22 21"
//                                     className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
//                                 >
//                                     <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm3.78 6.22a.75.75 0 01.072.832l-3.5 7a.75.75 0 01-1.296.078l-3.5-7a.75.75 0 01.962-1.04L10 6.804l2.984-1.456a.75.75 0 01.796.872z" />
//                                 </svg>
//                                 <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
//                                     Find Routes
//                                 </span>
//                                 <svg
//                                     className={`w-3 h-3 transform transition-transform ${isDropdownOpenRoutes ? "rotate-180" : ""
//                                         }`}
//                                     aria-hidden="true"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     fill="none"
//                                     viewBox="0 0 10 6"
//                                 >
//                                     <path
//                                         stroke="currentColor"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth="2"
//                                         d="m1 1 4 4 4-4"
//                                     />
//                                 </svg>
//                             </button>
//                             <ul
//                                 className={`py-2 space-y-2 ${isDropdownOpenRoutes ? "" : "hidden"
//                                     }`}
//                             >
//                                 <li>
//                                     <a
//                                         href="#"
//                                         className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
//                                     >
//                                         Home To Schools
//                                     </a>
//                                 </li>
//                                 <li>
//                                     <a
//                                         href="#"
//                                         className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
//                                     >
//                                         But To Schools
//                                     </a>
//                                 </li>
//                             </ul>
//                         </li>
//                         <li>
//                             <a
//                                 href="#"
//                                 className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
//                             >
//                                 <svg
//                                     className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
//                                     aria-hidden="true"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     fill="currentColor"
//                                     viewBox="0 0 22 21"
//                                 >
//                                     <path d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM11.25 6a.75.75 0 011.5 0v5.25h3a.75.75 0 110 1.5h-3.75a.75.75 0 01-.75-.75V6z" />
//                                 </svg>
//                                 <span className="ms-3">History Routes</span>
//                             </a>
//                         </li>
//                         <li>
//                             <a
//                                 href="#"
//                                 className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
//                             >
//                                 <svg
//                                     aria-hidden="true"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     fill="currentColor"
//                                     viewBox="0 0 22 21"
//                                     className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
//                                 >
//                                     <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
//                                     <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
//                                     <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
//                                 </svg>
//                                 <span className="flex-1 ms-3 whitespace-nowrap">Students</span>
//                                 {/* <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
//                   Pro
//                 </span> */}
//                             </a>
//                         </li>
//                         {/* Add more list items as per your structure */}
//                     </ul>
//                 </div>
//             </aside>

          
//         </>
//     );
// }
