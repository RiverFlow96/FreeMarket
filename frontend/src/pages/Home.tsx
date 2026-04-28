import {SearchBar} from '../components/SearchBar'
export function Home() {
    return (
        <>
            <div className='w-screen h-screen flex items-center justify-center flex-col'>
                <h1 className='font-mono text-2xl font-bold'>FreeMarket</h1>
                <SearchBar />
            </div>
        </>
    )
}
