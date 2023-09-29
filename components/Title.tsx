const Title = ({ title, subTitle }: { title: string, subTitle?: string }) => {
  return (
    <div className='flex-1 text-2xl text-gray-700 text-left dark:text-gray-300'>
      <div className='flex items-start space-x-2'>
        <div>{ title }</div>
        {
          subTitle && <div className='text-sm'>[Canvass: { subTitle }]</div>
        }
      </div>
    </div>
  )
}

export default Title
