import { NextResponse } from "next/server"
type _JSON = {[key:string]:any}

export const AppResponse = {
    success<T = _JSON>(data:T, status = 200){
        return NextResponse.json({status, data}, {status})
    },
    error<T = _JSON>(data:T, status = 400){
        return NextResponse.json({status, data}, {status})
    },
}