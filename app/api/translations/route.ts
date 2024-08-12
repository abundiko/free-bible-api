import { NextRequest } from "next/server";
import { AppResponse } from "@/utils/response";
import { TRANSLATIONS } from "@/constants/translations";

export function GET(req:NextRequest){
try {
    return AppResponse.success(TRANSLATIONS)
} catch (error) {
    return AppResponse.error("Internal server error", 500)
}
}