import { NextResponse } from "next/server";
import { ApiResponse } from "../types/api";

export function success<T = Record<string, unknown>>(
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

export function error(message: string, code: number, data: unknown = null) {
	const body: ApiResponse<unknown> = {
		code,
		message,
		data,
	};
	return NextResponse.json(body, { status: code });
}
