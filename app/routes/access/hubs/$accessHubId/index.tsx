import React, { Fragment } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  LinkIcon,
  LocationMarkerIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import { Menu, Transition } from "@headlessui/react";
import { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
import {
  Button,
  Main,
  Header,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type LoaderData = {
  accessHub: Prisma.AccessHubGetPayload<{
    include: {
      accessPoints: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessHubId },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessHub = await db.accessHub.findFirst({
    where: { id: Number(accessHubId), user: { id: userId } },
    include: {
      accessPoints: {
        orderBy: { position: "asc" },
      },
    },
    rejectOnNotFound: true,
  });
  return { accessHub };
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <Header
        title={accessHub.name}
        meta={
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <LocationMarkerIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {accessHub.description}
            </div>
          </div>
        }
        side={
          <>
            <span className="hidden sm:block">
              <Button variant="white" onClick={() => navigate("activity")}>
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Activity
              </Button>
            </span>
            <span className="sm:ml-3">
              <Button onClick={() => navigate("edit")}>
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Edit
              </Button>
            </span>

            {/* Dropdown */}
            <Menu as="span" className="relative ml-3 sm:hidden">
              <Menu.Button as={React.Fragment}>
                <Button variant="white">
                  More
                  <ChevronDownIcon
                    className="-mr-1 ml-2 h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                </Button>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 -mr-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="activity"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Activity
                      </Link>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </>
        }
      />
      <Main>
        <section>
          <div className="bg-white pt-6 shadow sm:overflow-hidden sm:rounded-md">
            <div className="px-4 sm:px-6 lg:px-8">
              <h2
                id="access-points-heading"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Access Points
              </h2>
            </div>
            <div className="mt-6">
              <Table
                decor="edge"
                headers={
                  <>
                    <Th>Position</Th>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <ThSr>View</ThSr>
                  </>
                }
              >
                {accessHub.accessPoints.map((i) => (
                  <tr key={i.id}>
                    <Td>{i.position}</Td>
                    <TdProminent>{i.name}</TdProminent>
                    <Td>{i.description}</Td>
                    <TdLink to={`./../../points/${i.id}`}>View</TdLink>
                  </tr>
                ))}
              </Table>
            </div>
          </div>
        </section>
      </Main>
    </>
  );
}
