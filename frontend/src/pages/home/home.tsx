import React from "react";
import {
  Database,
  ArrowRight,
  Swords,
  Lightbulb,
  FileText,
  Layers,
  Sparkles,
  LayoutGrid,
  BrainCircuit,
  BarChart3,
  Globe,
  LayoutDashboard,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();

  const modules = [
    {
      icon: Database,
      title: t('Home.moduleInfo'),
      description: t('Home.moduleInfoDesc'),
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Swords,
      title: t('Home.moduleCompetitors'),
      description: t('Home.moduleCompetitorsDesc'),
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: Lightbulb,
      title: t('Home.moduleIdeas'),
      description: t('Home.moduleIdeasDesc'),
      gradient: 'from-amber-500 to-yellow-500',
    },
    {
      icon: FileText,
      title: t('Home.moduleContent'),
      description: t('Home.moduleContentDesc'),
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      icon: Layers,
      title: t('Home.moduleGallery'),
      description: t('Home.moduleGalleryDesc'),
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      icon: Sparkles,
      title: t('Home.moduleAI'),
      description: t('Home.moduleAIDesc'),
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const showcaseItems = [
    {
      icon: LayoutDashboard,
      title: t('Home.pageDashboard'),
      gradient: 'from-sky-500 to-blue-600',
      detailedDesc: t('Home.pageDashboardDesc'),
      features: [t('Home.pageDashboardF1'), t('Home.pageDashboardF2'), t('Home.pageDashboardF3'), t('Home.pageDashboardF4')],
    },
    {
      icon: Building2,
      title: t('Home.pageBusinesses'),
      gradient: 'from-slate-600 to-slate-800',
      detailedDesc: t('Home.pageBusinessesDesc'),
      features: [t('Home.pageBusinessesF1'), t('Home.pageBusinessesF2'), t('Home.pageBusinessesF3'), t('Home.pageBusinessesF4')],
    },
    {
      icon: Database,
      title: t('Home.pageInfo'),
      gradient: 'from-blue-500 to-blue-600',
      detailedDesc: t('Home.pageInfoDesc'),
      features: [t('Home.pageInfoF1'), t('Home.pageInfoF2'), t('Home.pageInfoF3'), t('Home.pageInfoF4')],
    },
    {
      icon: Swords,
      title: t('Home.pageCompetitors'),
      gradient: 'from-red-500 to-orange-500',
      detailedDesc: t('Home.pageCompetitorsDesc'),
      features: [t('Home.pageCompetitorsF1'), t('Home.pageCompetitorsF2'), t('Home.pageCompetitorsF3'), t('Home.pageCompetitorsF4')],
    },
    {
      icon: Lightbulb,
      title: t('Home.pageIdeas'),
      gradient: 'from-amber-500 to-yellow-500',
      detailedDesc: t('Home.pageIdeasDesc'),
      features: [t('Home.pageIdeasF1'), t('Home.pageIdeasF2'), t('Home.pageIdeasF3'), t('Home.pageIdeasF4')],
    },
    {
      icon: FileText,
      title: t('Home.pageContent'),
      gradient: 'from-emerald-500 to-green-500',
      detailedDesc: t('Home.pageContentDesc'),
      features: [t('Home.pageContentF1'), t('Home.pageContentF2'), t('Home.pageContentF3'), t('Home.pageContentF4')],
    },
    {
      icon: Layers,
      title: t('Home.pageAssets'),
      gradient: 'from-purple-500 to-violet-500',
      detailedDesc: t('Home.pageAssetsDesc'),
      features: [t('Home.pageAssetsF1'), t('Home.pageAssetsF2'), t('Home.pageAssetsF3'), t('Home.pageAssetsF4')],
    },
    {
      icon: Sparkles,
      title: t('Home.pageAI'),
      gradient: 'from-pink-500 to-rose-500',
      detailedDesc: t('Home.pageAIDesc'),
      features: [t('Home.pageAIF1'), t('Home.pageAIF2'), t('Home.pageAIF3'), t('Home.pageAIF4')],
    },
  ];

  const stats = [
    { icon: LayoutGrid, label: t('Home.statModules') },
    { icon: BrainCircuit, label: t('Home.statAI') },
    { icon: BarChart3, label: t('Home.statAnalytics') },
    { icon: Globe, label: t('Home.statPlatforms') },
  ];

  return (
    <section>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center py-28 px-6 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />

        <span className="relative inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
          <Sparkles size={14} />
          {t('Home.badge')}
        </span>

        <h2 className="relative text-5xl md:text-6xl font-bold mb-5 text-slate-900 max-w-3xl leading-tight">
          {t('Home.heroTitle')} <span className="text-blue-600">NovaCRM</span>
        </h2>
        <p className="relative text-slate-600 text-lg max-w-2xl mb-10">
          {t('Home.heroSubtitle')}
        </p>

        <div className="relative flex gap-4 flex-wrap justify-center">
          <Link
            to="/signUp"
            className="px-7 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            {t('Home.startFree')} <ArrowRight size={18} />
          </Link>

          <button className="px-7 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
            {t('Home.seeHowItWorks')}
          </button>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-8 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-700">
                <Icon size={20} className="text-blue-600 shrink-0" />
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900">
            {t('Home.modulesTitle')}
          </h3>
          <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">
            {t('Home.modulesSubtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(({ icon: Icon, title, description, gradient }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">{title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left sticky navigation */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">{t('Home.showcaseTitle')}</h3>
              <nav className="space-y-3">
                {showcaseItems.map(({ icon: Icon, title, gradient }) => (
                  <div key={title} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-sm">{title}</span>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right scrolling content */}
            <div className="lg:col-span-8 space-y-16">
              {showcaseItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className={`h-64 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                    <item.icon size={64} className="text-white/30" />
                  </div>
                  <div className="p-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                    <p className="text-slate-600 mb-6 leading-relaxed">{item.detailedDesc}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {item.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">{t('Home.ctaTitle')}</h3>
        <p className="mb-8 text-blue-100 max-w-xl mx-auto">
          {t('Home.ctaDesc')}
        </p>
        <Link
          to="/signUp"
          className="inline-block px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
        >
          {t('Home.tryItFree')}
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} NovaCRM. {t('Footer.allRightsReserved')}</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white">{t('Footer.privacyPolicy')}</a>
            <a href="#" className="hover:text-white">{t('Footer.terms')}</a>
            <a href="#" className="hover:text-white">{t('Footer.support')}</a>
          </div>
        </div>
      </footer>
    </section>
  );
}

export default Home;
