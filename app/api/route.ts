import { error, success } from "@/lib/response";

export async function GET(request: Request) {
	try {
		return success(200, "ok", {
			service: "api",
			status: "healthy",
			timestamp: new Date().toISOString(),
		});
	} catch (err) {
		console.error("Error in health endpoint:", err);
		return error("Service not healthy", 500);
	}
}
