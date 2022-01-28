import * as React from "react";
import type { ActionFunction } from "remix";
import { useActionData, Form, redirect } from "remix";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

function validateName(name: string) {
  if (name.length === 0) {
    return "Name is required.";
  }
  if (name.length > 100) {
    return "Name is too long.";
  }
}

function validateDescription(description: string) {
  if (description.length > 500) {
    return "Description is too long.";
  }
}

function validateCode(code: string) {
  if (code.length === 0) {
    return "Code is required.";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name?: string | undefined;
    description?: string | undefined;
    code?: string | undefined;
    // enabled?: string | undefined;
  };
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const formData = await request.formData();
  // Node FormData get() seems to return null for empty string value.
  // Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);
  const { name, description, code, enabled } = fieldValues;
  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof code !== "string"
  ) {
    return { formError: `Form not submitted correctly.` };
  }

  const fieldErrors = {
    name: validateName(name),
    description: validateDescription(description),
    code: validateCode(code),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fieldValues };
  }

  const userId = await requireUserId(request);
  const accessUser = await db.accessUser.create({
    data: {
      name,
      description,
      code,
      userId: Number(userId),
    },
  });

  return redirect(`${accessUser.id}`);
};

export default function Create() {
  const actionData = useActionData<ActionData>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Create User
      </h1>
      <Form reloadDocument replace method="post">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {actionData?.formError}
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
                  actionData?.fieldValues ? actionData.fieldValues.name : ""
                }
                className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {actionData?.fieldErrors?.name ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.fieldErrors.name}
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
                    : ""
                }
                className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {actionData?.fieldErrors?.description ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.fieldErrors.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Code
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="code"
                id="code"
                defaultValue={
                  actionData?.fieldValues ? actionData.fieldValues.code : ""
                }
                className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {actionData?.fieldErrors?.code ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.fieldErrors.code}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="enabled"
                name="enabled"
                type="checkbox"
                defaultChecked={
                  actionData?.fieldValues
                    ? actionData.fieldValues.enabled
                    : true
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="enabled" className="font-medium text-gray-700">
                Enabled
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          {/* <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button> */}
          <button
            type="submit"
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create
          </button>
        </div>
      </Form>
    </div>
  );
}
