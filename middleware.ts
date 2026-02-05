export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/projects/:path*",
    "/scripts/:path*",
    "/tasks/:path*",
    "/team/:path*",
    "/budget/:path*",
    "/locations/:path*",
  ],
}
