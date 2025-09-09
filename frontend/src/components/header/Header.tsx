import { Link } from 'react-router-dom';
import React from "react";

function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/">CRM</Link>
        </div>

        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
        </nav>

        <nav>
          <Link className="mr-3" to="/signIn">Sign In</Link>
          <Link to="/signUp">Sign Up</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header;