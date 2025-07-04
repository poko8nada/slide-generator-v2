export default function UserLevel({
  isPro,
  isLoggedIn,
}: { isPro: boolean; isLoggedIn: boolean }) {
  if (!isLoggedIn) return null
  return (
    <div>
      {isPro ? (
        <span className='ml-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-300'>
          PRO
        </span>
      ) : (
        <span className='ml-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-xs font-semibold'>
          free
        </span>
      )}
    </div>
  )
}
