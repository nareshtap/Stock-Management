import axiosInstance from "@lib/axiosInstance";


/**
 * Handles GET requests for fetching data from the API.
 * Extracts query parameters from the request URL, constructs an API call,
 * and returns the response data or an error message if the request fails.
 *
 * @param request - The incoming HTTP request.
 * @returns A JSON response with the fetched data or an error message.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = url.searchParams.get("page") || "1";
  const pageSize = url.searchParams.get("pageSize") || "10";
  const searchQuery = url.searchParams.get("searchQuery") || "";
  const sortBy = url.searchParams.get("sortBy") || "";
  const sortOrder = url.searchParams.get("sortOrder") || "asc";

  try {
    const response = await axiosInstance.get("/data-import", {
      params: {
        page,
        pageSize,
        searchQuery,
        sortBy,
        sortOrder,
      },
    });
    const data = await response.data;

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Failed to fetch data", errors: error }, { status: 500 });
  }
}
