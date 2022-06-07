import Image from 'next/image'

function Background() {
  return (
        <Image
            src='/background-desktop.svg'
            alt='background'
            layout="fill"
            objectFit="cover"
            className='h-full'
        />
  )
}

export default Background