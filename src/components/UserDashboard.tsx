import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import { IGrocery } from '@/models/grocery.model'
import GroceryItemCard from './GroceryItemCard'
import Link from 'next/link'

interface Props {
  groceryList: IGrocery[]
  totalCount: number
  currentPage: number
  itemsPerPage: number
}

async function UserDashboard({ groceryList, totalCount, currentPage, itemsPerPage }: Props) {

  const plainGrocery = JSON.parse(JSON.stringify(groceryList))
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const hasPrev = currentPage > 0
  const hasNext = currentPage < totalPages - 1

  return (
    <>
      <HeroSection />
      <CategorySlider />
      <div className='w-[90%] md:w-[80%] mx-auto mt-10'>
        <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center'>
          Popular Grocery
        </h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
          {plainGrocery.map((item: any, index: number) => (
            <GroceryItemCard key={index} item={item} index={index} />
          ))}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className='flex items-center justify-center gap-4 mt-10 mb-4'>
            {hasPrev ? (
              <Link
                href={`/?page=${currentPage - 1}`}
                className='px-5 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all shadow'
              >
                ← Previous
              </Link>
            ) : (
              <span className='px-5 py-2 rounded-full bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed'>
                ← Previous
              </span>
            )}

            <span className='text-sm text-gray-600 font-medium'>
              Page {currentPage + 1} of {totalPages}
            </span>

            {hasNext ? (
              <Link
                href={`/?page=${currentPage + 1}`}
                className='px-5 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all shadow'
              >
                Next →
              </Link>
            ) : (
              <span className='px-5 py-2 rounded-full bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed'>
                Next →
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default UserDashboard