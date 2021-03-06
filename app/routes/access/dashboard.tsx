import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, useFetcher, useLocation } from "remix";
import type { AccessHub, AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
import {
  Main,
  Header,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";

export const handle = {
  breadcrumb: "Dashboard",
};

type LoaderData = {
  accessPoints: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
      accessHub: {
        include: {
          user: true;
        };
      };
    };
  }>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessPoints = await db.accessPoint.findMany({
    where: {
      accessHub: {
        userId: userId,
      },
    },
    include: {
      accessUsers: true,
      accessHub: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [{ accessHub: { name: "asc" } }, { name: "asc" }],
  });
  return { accessPoints };
};

function connectionStatus(heartbeatAt: AccessHub["heartbeatAt"]) {
  if (heartbeatAt) {
    const deltaMs = Date.now() - new Date(heartbeatAt).getTime();
    if (deltaMs < 5 * 1000) {
      return "Live";
    }
    if (deltaMs < 10 * 1000) {
      return "Dying";
    }
  }
  return "Dead";
}

export default function RouteComponent() {
  const { accessPoints } = useLoaderData<LoaderData>();
  const poll = useFetcher<LoaderData>();
  const [isPolling, setIsPolling] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    if (isPolling) {
      const intervalId = setInterval(() => poll.load(location.pathname), 5000);
      return () => clearInterval(intervalId);
    }
  }, [location, isPolling]);
  return (
    <>
      <Header
        title="Dashboard"
        side={
          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="poll"
                aria-describedby="comments-description"
                name="poll"
                type="checkbox"
                checked={isPolling}
                onChange={() => setIsPolling(!isPolling)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="poll" className="font-medium text-gray-700">
                Poll
              </label>
            </div>
          </div>
        }
      />
      <Main>
        <Table
          headers={
            <>
              <Th>Hub</Th>
              <Th>Name</Th>
              <Th>Connection</Th>
              <ThSr>View</ThSr>
            </>
          }
        >
          {(poll.data?.accessPoints ?? accessPoints).map((i) => (
            <tr key={i.id}>
              <Td>{i.accessHub.name}</Td>
              <TdProminent>{i.name}</TdProminent>
              <Td>{connectionStatus(i.accessHub.heartbeatAt)}</Td>
              <TdLink to={`../points/${i.id}`}>View</TdLink>
            </tr>
          ))}
        </Table>
      </Main>
    </>
  );
}
