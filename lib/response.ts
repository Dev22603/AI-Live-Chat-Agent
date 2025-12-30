import { NextResponse } from "next/server";
import { ApiResponse } from "../types/api";

export function success<T extends Record<string, any>>(
	code: number,
	message: string,
	data: T
) {
	const body: ApiResponse<T> = {
		code,
		message,
		data,
	};
	return NextResponse.json(body, { status: code });
}

export function error(message: string, code: number, data: any = null) {
	const body: ApiResponse<any | null> = {
		code,
		message,
		data,
	};
	return NextResponse.json(body, { status: code });
}
