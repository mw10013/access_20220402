import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, redirect } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import type { ZodError } from "zod";
import { z } from "zod";

type LoaderData = { accessPoint: AccessPoint };

export const loader: LoaderFunction = async ({
  request,
  params: { accessPointId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessPoint = await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessManager: { user: { id: Number(userId) } },
    },
    rejectOnNotFound: true,
  });
  return { accessPoint };
};

const FieldValues = z
  .object({
    name: z.string().nonempty().max(50),
    description: z.string().max(100),
  })
  .strict();
type FieldValues = z.infer<typeof FieldValues>;

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params: { accessPointId },
}): Promise<Response | ActionData> => {
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  const userId = await requireUserId(request);
  await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessManager: { user: { id: Number(userId) } },
    },
    rejectOnNotFound: true,
  });

  await db.accessPoint.update({
    where: { id: Number(accessPointId) },
    data: {
      name: parseResult.data.name,
      description: parseResult.data.description,
    },
  });

  return redirect(`/access/points/${accessPointId}`);
};

export default function RouteComponent() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Edit Access Point
      </h1>
      <Form replace method="post">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {actionData?.formErrors?.formErrors.join(". ")}
          </h3>
          <p className="mt-1 text-sm text-gray-500"></p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={
                  actionData?.fieldValues
                    ? actionData.fieldValues.name
                    : accessPoint.name
                }
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              />
            </div>
            {actionData?.formErrors?.fieldErrors.name ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="name-error"
              >
                {actionData.formErrors.fieldErrors.name.join(". ")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="description"
                id="description"
                defaultValue={
                  actionData?.fieldValues
                    ? actionData.fieldValues.description
                    : accessPoint.description
                }
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              />
            </div>
            {actionData?.formErrors?.fieldErrors?.description ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="description-error"
              >
                {actionData.formErrors.fieldErrors.description.join(". ")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid justify-items-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </Form>
    </div>
  );
}
