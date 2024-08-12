'use client'

export type RequestBlockProps = {
    method: 'GET' | 'POST',
    url: string;
}

export function RequestBlock({method, url}:RequestBlockProps){
    return(
        <div 
        style={{
            backgroundColor: method == 'GET' ? 'green' : 'orange'
        }}
        className="flex gap-2 rounded-md">
            <div className="rounded p-2 flex-shrink-0 text-black font-semibold">{method}</div>
            <div className="text-yellow-200 py-2 px-4 bg-[#ffffff11] w-full">{url}</div>
        </div>
    )
}