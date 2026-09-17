import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Languages } from "../../const/Languages";

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
      {Languages.map((language) => (
        <option key={language.value} value={language.value}>
          {language.flag} {language.code}
        </option>
      ))}
    </select>
  );
}

export default LanguageSwitcher;
