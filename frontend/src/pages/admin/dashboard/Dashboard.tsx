import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { useGetBusinessesMutation } from '../../../store/businesses/businessesApi'
import { setBusinesses } from '../../../store/businesses/businessesSlice'
import { BusinessStatus } from '../../../enum/BusinessStatus'
import { BusinessGrowthChart } from './components/BusinessGrowthChart/BusinessGrowthChart'
import { BusinessStatusChart } from './components/BusinessStatusChart/BusinessStatusChart'
import { BusinessListByStatus } from './components/BusinessListByStatus/BusinessListByStatus'
import { showError } from '../../../utils/showError'

export function Dashboard() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const businesses = useAppSelector((state) => state.businessModule.businesses)
  const [getBusinesses] = useGetBusinessesMutation()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBusinesses().unwrap()
        dispatch(setBusinesses(res.data ?? []))
      } catch (error) {
        showError(error)
      }
    }

    fetchData()
  }, [dispatch, getBusinesses])

  const totalCount = businesses?.length ?? 0
  const activeCount = businesses?.filter((b) => b.status === BusinessStatus.Active).length ?? 0

  return (
    <section>
      <section>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-semibold">{t('Dashboard.title')}</h1>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-4">
        <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500">{t('Dashboard.totalBusinesses')}</h2>
          <p className="text-3xl font-bold text-slate-800 mt-1">{totalCount}</p>
        </div>

        <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500">{t('Dashboard.activeBusinesses')}</h2>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 px-4">
        <div className="lg:col-span-2">
          <BusinessGrowthChart businesses={businesses ?? []} />
        </div>
        <BusinessStatusChart businesses={businesses ?? []} />
      </div>

      <BusinessListByStatus businesses={businesses ?? []} />
    </section>
  )
}

export default Dashboard
