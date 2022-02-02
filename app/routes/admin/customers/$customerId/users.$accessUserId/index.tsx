import { LinkIcon, CheckIcon } from "@heroicons/react/solid";
import { Prisma } from "@prisma/client";
import { LoaderFunction, useLoaderData, useNavigate } from "remix";
import {
  Button,
  Card,
  Header,
  Main,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";

type LoaderData = {
  accessUser: Prisma.AccessUserGetPayload<{
    include: {
      accessPoints: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessUserId },
}): Promise<LoaderData> => {
  await requireUserSession(request, "admin");
  const accessUser = await db.accessUser.findFirst({
    where: {
      id: Number(accessUserId),
      user: { id: Number(customerId) },
    },
    include: {
      accessPoints: { orderBy: { name: "asc" } },
    },
    rejectOnNotFound: true,
  });
  return { accessUser };
};

export default function RouteComponent() {
  const { accessUser } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title={accessUser.name} />
      <Main>
        <Card title="Points">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Name</Th>
                <Th>ID</Th>
                <Th>Heartbeat At</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessUser.accessPoints.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>
                  {i.heartbeatAt && new Date(i.heartbeatAt).toLocaleString()}
                </Td>

                <TdLink
                  to={`../../managers/${i.accessManagerId}/points/${i.id}`}
                >
                  View
                </TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}