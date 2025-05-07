import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function UpstartPopup() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-900 p-4">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold"
      >
        {t('Open Upstart Tutorial')}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-[90%] max-h-[80vh] overflow-y-auto text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('Upstart Quantitative Tutorial')}</h2>
              <button onClick={() => setOpen(false)} className="text-2xl">&times;</button>
            </div>
            {/* 본문 내용 */}
            <div className="space-y-4 text-sm">
              <p>{t('Upstart.title')}</p>
              <p className="font-bold">{t('Upstart.vip_upgrade_criteria')}</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>{t('Upstart.vip.vip1')}</li>
                <li>{t('Upstart.vip.vip2')}</li>
                <li>{t('Upstart.vip.vip3')}</li>
                <li>{t('Upstart.vip.vip4')}</li>
                <li>{t('Upstart.vip.vip5')}</li>
                <li>{t('Upstart.vip.vip6')}</li>
              </ul>
              <p className="font-bold">{t('Upstart.overview.description')}</p>
              <p>{t('Upstart.overview.advantages')}</p>
              <p>{t('Upstart.overview.assets')}</p>
              <p>{t('Upstart.overview.automation')}</p>
              <p>{t('Upstart.overview.no_manual')}</p>
              <p className="font-bold">{t('Upstart.method.title')}</p>
              <p>{t('Upstart.method.step')}</p>
              <p>{t('Upstart.method.profit_share')}</p>
              <p>{t('Upstart.method.example')}</p>
              <p className="font-bold">VIP Daily Trading Info</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>{t('Upstart.vip_daily.vip1')}</li>
                <li>{t('Upstart.vip_daily.vip2')}</li>
                <li>{t('Upstart.vip_daily.vip3')}</li>
                <li>{t('Upstart.vip_daily.vip4')}</li>
                <li>{t('Upstart.vip_daily.vip5')}</li>
                <li>{t('Upstart.vip_daily.vip6')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
