import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: 'fr' | 'en' | 'ar') => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2">
      <FaGlobe className="text-neutral-400" />
      <button
        onClick={() => handleLanguageChange('fr')}
        className={`text-sm cursor-pointer font-semibold ${i18n.language === 'fr' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
      >
        FR
      </button>
      <span className="text-neutral-600">|</span>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`text-sm cursor-pointer font-semibold ${i18n.language === 'en' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
      >
        EN
      </button>

      <span className="text-neutral-600">|</span>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`text-sm cursor-pointer font-semibold ${i18n.language === 'ar' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
      >
        ع
      </button>
    </div>
  );
};