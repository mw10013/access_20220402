import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Access Hub",
};

export default function RouteComponent() {
  return <Outlet />;
}
