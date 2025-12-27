import { NextResponse } from "next/server";
import { ApiResponse } from "../types/api";

export function success<T extends Record<string, any>>(code: number, message: string, data: T) {
	const body: ApiResponse<T> = {
		code,
		message,
		data,
	};
	return NextResponse.json(body, { status: code });
}

export function error(message: string, code: 400) {
	const body: ApiResponse<null> = {
		code,
		message,
		data: null,
	};
    return NextResponse.json(body, { status: code });
}
