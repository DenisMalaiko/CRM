import React from "react";
import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";

function Client() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="w-full rounded-2xl bg-white shadow border border-slate-200 mb-4">
        <div className="w-full flex items-center p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back
          </button>
        </div>
      </div>

      <section className="w-full min-h-screen">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="col-span-1 space-y-6">

            {/* Basic Info */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Базова інформація</h2>
              </div>
              <div className="p-4 text-sm space-y-1">
                <p>Ім’я / Компанія</p>
                <p>Email</p>
                <p>Телефон</p>
                <p>Статус</p>
                <p>Джерело ліда</p>
                <p>Дата створення</p>
                <p>Відповідальний менеджер</p>
              </div>
            </div>

            {/* Integrations */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Рекламні канали</h2>
              </div>
              <div className="p-4 text-sm space-y-1">
                <p>Meta Ads — статус</p>
                <p>Google Ads — статус</p>
                <p>TikTok Ads — статус</p>
                <p>Остання синхронізація</p>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Нотатки</h2>
              </div>
              <div className="p-4 text-sm space-y-1">
                <p>Нотатки маркетолога</p>
                <p>Коментарі</p>
                <p>Задачі</p>
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Налаштування</h2>
              </div>
              <div className="p-4 text-sm space-y-1">
                <p>Редагувати дані</p>
                <p>Змінити менеджера</p>
                <p>Підключення каналів</p>
                <p>Видалити клієнта</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-2 space-y-6">

            {/* Performance Section */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Performance Overview</h2>
              </div>
              <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500">ROAS</p>
                  <p className="text-xl font-semibold">—</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Spend</p>
                  <p className="text-xl font-semibold">—</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Purchases / Leads</p>
                  <p className="text-xl font-semibold">—</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="text-xl font-semibold">—</p>
                </div>
              </div>
            </div>

            {/* Campaigns */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Рекламні кампанії</h2>
              </div>
              <div className="p-4 text-sm">
                <p>Таблиця з кампаніями клієнта</p>
              </div>
            </div>

            {/* Creatives */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Креативи</h2>
              </div>
              <div className="p-4 text-sm">
                <p>Блок з прев’ю креативів</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Активності</h2>
              </div>
              <div className="p-4 text-sm">
                <p>Історія дій: запуск кампаній, редагування бюджетів, інтеграції</p>
              </div>
            </div>

            {/* Products */}
            <div className="rounded-2xl bg-white shadow border border-slate-200">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800">Продукти клієнта</h2>
              </div>
              <div className="p-4 text-sm">
                <p>Товари, послуги, топ-продажі</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </section>
  )
}
export default Client;