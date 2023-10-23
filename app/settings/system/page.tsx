'use client'
import TopBar from '@/components/TopBar'
import { Sidebar, SettingsSideBar, Title } from '@/components'
import { useSupabase } from '@/context/SupabaseProvider'
import React, { useEffect, useState } from 'react'
import SelectUserNames from './SelectUserNames'
import { useFilter } from '@/context/FilterContext'

import type { settingsDataTypes } from '@/types'

const Page: React.FC = () => {
  const { supabase } = useSupabase()
  const [settingsData, setSettingsData] = useState<settingsDataTypes[] | []>([])
  const [results, setResults] = useState(false)
  const [settingsId, setSettingsId] = useState(null)
  const { setToast } = useFilter()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (saving) return

    setSaving(true)

    let query = supabase
      .from('system_settings')

    if (settingsId) {
      query = query.upsert({ id: settingsId, type: 'system_access', data: settingsData })
    } else {
      query = query.insert({ type: 'system_access', org_id: process.env.NEXT_PUBLIC_ORG_ID, data: settingsData })
    }
    query = query.select()

    const { error } = await query

    if (error) {
      console.error(error)
    } else {
      // pop up the success message
      setToast('success', 'Successfully saved.')
    }

    setSaving(false)
  }

  const handleManagerChange = (newdata: any, type: string) => {
    const tempSettings = Array.isArray(settingsData) ? settingsData.filter((item: settingsDataTypes) => item.access_type !== type) : []
    const updatedSettings: settingsDataTypes[] = [...tempSettings, { access_type: type, data: newdata }]
    setSettingsData(updatedSettings)
  }

  const fetchData = async () => {
    const { data: res, error } = await supabase
      .from('system_settings')
      .select()
      .eq('type', 'system_access')
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)
      .limit(1)
      .single()

    if (error) console.error(error)

    if (res) {
      setResults(true)
      setSettingsData(res.data)
      setSettingsId(res.id)
    }
  }

  useEffect(() => {
    void fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Sidebar>
        <SettingsSideBar/>
      </Sidebar>
      <TopBar/>
      <div className="app__main">
        <div>
            <div className='app__title'>
              <Title title='System Permissions'/>
            </div>

            <div className='app__content'>
              {
                results && (
                  <>
                  <SelectUserNames handleManagerChange={handleManagerChange} multiple={true} type='settings' settingsData={Array.isArray(settingsData) ? settingsData.filter((item: settingsDataTypes) => item.access_type === 'settings') : []} title='Who can manage System Settings and Login Accounts'/>
                  <SelectUserNames handleManagerChange={handleManagerChange} multiple={true} type='human_resource' settingsData={Array.isArray(settingsData) ? settingsData.filter((item: settingsDataTypes) => item.access_type === 'human_resource') : []} title='Who can manage Human Resource'/>
                  <SelectUserNames handleManagerChange={handleManagerChange} multiple={true} type='canvass' settingsData={Array.isArray(settingsData) ? settingsData.filter((item: settingsDataTypes) => item.access_type === 'canvass') : []} title='Who can create Price Canvass & Purchase Orders'/>
                  <SelectUserNames handleManagerChange={handleManagerChange} multiple={true} type='approve_price_canvass' settingsData={Array.isArray(settingsData) ? settingsData.filter((item: settingsDataTypes) => item.access_type === 'approve_price_canvass') : []} title='Who can Approve Price Canvass & Purchase Orders'/>
                  <SelectUserNames handleManagerChange={handleManagerChange} multiple={true} type='manage_pos' settingsData={Array.isArray(settingsData) ? settingsData.filter((item: settingsDataTypes) => item.access_type === 'manage_pos') : []} title='Who can manage Point of Sale'/>
                  <SelectUserNames handleManagerChange={handleManagerChange} multiple={true} type='cashers' settingsData={Array.isArray(settingsData) ? settingsData.filter((item: settingsDataTypes) => item.access_type === 'cashers') : []} title='Cashers of Point of Sale '/>
                  {/* <SelectUserNames handleManagerChange={handleManagerChange} multiple={true} type='projects' settingsData={Array.isArray(settingsData) ? settingsData.filter((item: settingsDataTypes) => item.access_type === 'projects') : []} title='Who can manage Projects'/> */}
                  </>
                )
              }
              <button
                onClick={handleSave}
                className="flex items-center bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 font-medium px-2 py-1 text-sm text-white rounded-sm">
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

        </div>
      </div>
    </>
  )
}
export default Page
