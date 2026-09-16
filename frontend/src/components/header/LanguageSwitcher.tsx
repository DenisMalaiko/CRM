import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
  };

  return (
    <select
      value={currentLanguage}
      onChange={handleChange}
      className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="en">🇺🇸 EN</option>
      <option value="ua">🇺🇦 UA</option>
    </select>
  );
}

export default LanguageSwitcher;
