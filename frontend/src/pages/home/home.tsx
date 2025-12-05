import React from "react";
import { CheckCircle, Users, BarChart3, Database, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <section>
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-24 px-6 bg-gradient-to-b from-blue-50 to-slate-50">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 max-w-3xl">
          Boost Campaign Performance with <span className="text-blue-600">NovaCRM</span>
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mb-8">
          Track leads, analyze customer behavior, automate follow-ups, and optimize marketing campaigns —
          all in one workspace designed for data-driven marketers.
        </p>

        <div className="flex gap-4">
          <Link
            to="/signUp"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            Start Free <ArrowRight size={18} />
          </Link>

          <button className="px-6 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100">
            See How It Works
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Tools Marketers Love</h3>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border bg-slate-50 hover:shadow-lg transition flex flex-col items-center justify-center">
              <Users className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Lead Management & Segmentation</h4>
              <p className="text-slate-600 text-sm">
                Capture leads from multiple channels, enrich profiles automatically,
                segment audiences, and run personalized campaigns with ease.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border bg-slate-50 hover:shadow-lg transition flex flex-col items-center justify-center">
              <Database className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Automation That Saves Hours</h4>
              <p className="text-slate-600 text-sm">
                Build automated funnels, follow-ups, reminders, and customer journeys
                to increase conversions without manual work.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border bg-slate-50 hover:shadow-lg transition flex flex-col items-center justify-center">
              <BarChart3 className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Deep Analytics & Attribution</h4>
              <p className="text-slate-600 text-sm">
                Understand which campaigns bring revenue, track ROI, monitor engagement,
                and make data-driven decisions with real-time dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 bg-blue-600 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Scale Your Marketing Smarter</h3>
        <p className="mb-8 text-blue-100">
          Join teams who use NovaCRM to automate workflows, convert more leads,
          and improve campaign performance from day one.
        </p>
        <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-slate-100">
          Try It Free
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} NovaCRM. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </section>
  )
}

export default Home;