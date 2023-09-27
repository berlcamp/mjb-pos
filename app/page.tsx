import { LoginBox, TopBarDark } from '@/components'

export default async function Page () {
  return (
    <>
      <div className="app__home">
        <TopBarDark isGuest={false}/>
        <div className='bg-gray-700 h-screen pt-32 px-6 md:flex items-start md:space-x-4 justify-center'>
            <LoginBox/>
        </div>
        <div className='bg-gray-800 p-4'>
          <div className='text-white text-center text-xs'>RDT Systems v1.0.0</div>
        </div>
      </div>
    </>
  )
}
