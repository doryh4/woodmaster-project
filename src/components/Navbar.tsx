import React from 'react';
import { Link } from 'react-router-dom';

function Navbar(): React.JSX.Element {
  return (
    <nav className="bg-stone-800 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center cursor-pointer hover:opacity-80 transition">
          <img src="/logo.jpg" alt="גיא ועץ לוגו" className="h-12 w-auto object-contain" />
        </Link>

        <ul className="flex gap-4 md:gap-8 items-center text-sm md:text-base">
          <li>
            <Link to="/" className="hover:text-orange-400 transition font-medium">דף הבית</Link>
          </li>
          <li>
            <Link to="/services" className="hover:text-orange-400 transition font-medium">סוגי עבודות</Link>
          </li>
          <li>
            <Link to="/pricing" className="hover:text-orange-400 transition font-medium">מחירון</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-orange-400 transition font-medium">צור קשר</Link>
          </li>
          <li className="hidden lg:block mr-4 border-r border-stone-600 pr-6">
            <a href="tel:0500000000" className="flex items-center gap-2 bg-orange-600 px-5 py-2 rounded-full font-bold hover:bg-orange-700 transition shadow-lg text-white">
              התקשרו עכשיו
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
