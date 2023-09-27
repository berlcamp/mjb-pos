import 'server-only'
import './globals.css'
import SupabaseListener from '@/utils/supabase-listener'
import SupabaseProvider from '@/context/SupabaseProvider'
import { createServerClient } from '@/utils/supabase-server'
import { FilterProvider } from '@/context/FilterContext'
import { Providers } from '@/GlobalRedux/provider'
import { Toaster } from 'react-hot-toast'
import { LandingPage } from '@/components'

import type { Metadata } from 'next'
import type { AccountTypes, settingsDataTypes } from '@/types'

export const metadata: Metadata = {
  title: 'RDT SYSTEMS',
  description: 'RDT SYSTEMS by BTC'
}

// do not cache this layout
export const revalidate = 0

export default async function RootLayout ({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  let sysUsers: AccountTypes[] | null = []
  let sysSettings: settingsDataTypes[] | null = []

  if (session) {
    const { data: systemSettings, error } = await supabase
      .from('system_settings')
      .select()
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    if (error) console.error(error)

    sysSettings = systemSettings

    const { data: systemUsers, error: systemUsersError } = await supabase
      .from('rdt_users')
      .select()
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    if (systemUsersError) console.error(systemUsersError)

    sysUsers = systemUsers
  }

  return (
    <html lang="en">
      <body className={`relative ${session ? 'bg-white' : 'bg-gray-100'}`}>

        <SupabaseProvider systemSettings={sysSettings} session={session} systemUsers={sysUsers}>
            <SupabaseListener serverAccessToken={session?.access_token} />
              {!session && <LandingPage/> }
              {
                session &&
                  <Providers>
                    <FilterProvider>
                      <Toaster/>
                      {children}
                    </FilterProvider>
                  </Providers>
              }
          </SupabaseProvider>
      </body>
    </html>
  )
}
