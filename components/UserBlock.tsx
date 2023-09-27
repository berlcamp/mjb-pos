'use client'
import React from 'react'
import Image from 'next/image'
import Avatar from 'react-avatar'
import { capitalizeWords } from '@/utils/text-helper'

// types
import type { AccountTypes } from '@/types'

interface PropTypes {
  user: AccountTypes
}

const UserBlock = ({ user }: PropTypes) => {
  return (
    <div className='flex items-center space-x-1'>
      {
        (user.avatar_url && user.avatar_url !== '')
          ? <div className='relative rounded-lg flex items-center justify-center bg-black overflow-hidden'>
              <Image src={user.avatar_url} width={30} height={30} alt='user'/>
            </div>
          : <Avatar round={true} size="30" name={user.name}/>
      }
      <div className='font-medium'>{capitalizeWords(user.name)}</div>
    </div>
  )
}
export default UserBlock
