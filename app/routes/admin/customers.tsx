import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Customers",
};

export default function RouteComponent() {
  return <Outlet />;
}
