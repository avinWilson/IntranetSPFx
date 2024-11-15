import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export const getSharePointListItems = async (
  /* eslint-disable @typescript-eslint/no-explicit-any */
  context: any,
  /* eslint-enable @typescript-eslint/no-explicit-any */
  listName: string,
  selectFields: string,
  filterQuery?: string
): Promise<SPHttpClientResponse> => {
  const endpoint = `${
    context.pageContext.web.absoluteUrl
  }/_api/web/lists/getbytitle('${listName}')/items?${selectFields}${
    filterQuery ? '&' + filterQuery : ''
  }`;
  const response = await context.spHttpClient.get(
    endpoint,
    SPHttpClient.configurations.v1
  );

  return response;
};

export const getSharePointListEntityType = async (
  /* eslint-disable @typescript-eslint/no-explicit-any */
  context: any,
  /* eslint-enable @typescript-eslint/no-explicit-any */
  listName: string,
  selectFields: string,
  filterQuery?: string
): Promise<string> => {
  const endpoint = `${
    context.pageContext.web.absoluteUrl
  }/_api/web/lists/getbytitle('${listName}')/items?${selectFields}${
    filterQuery ? '&' + filterQuery : ''
  }`;
  const response = await context.spHttpClient.get(
    endpoint,
    SPHttpClient.configurations.v1
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(responseText);
  }

  const responseJson = await response.json();

  return responseJson.ListEntityTypeFullName;
};

export const createSharePointListItem = async (
  /* eslint-disable @typescript-eslint/no-explicit-any */
  context: any,
  listName: string,
  body?: any
  /* eslint-enable @typescript-eslint/no-explicit-any */
): Promise<SPHttpClientResponse> => {
  const request = {
    body: JSON.stringify(body),
  };
  const endpoint = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items`;
  const response = await context.spHttpClient.post(
    endpoint,
    SPHttpClient.configurations.v1,
    request
  );

  return response;
};

export const updateSharePointListItem = async (
  /* eslint-disable @typescript-eslint/no-explicit-any */
  context: any,
  listName: string,
  itemId: number,
  fieldsToUpdate: { [key: string]: any }
  /* eslint-enable @typescript-eslint/no-explicit-any */
): Promise<SPHttpClientResponse> => {
  try {
    // Endpoint to get the existing list item
    const getEndpoint = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`;

    // Get request to fetch the item
    const getResponse = await context.spHttpClient.get(
      getEndpoint,
      SPHttpClient.configurations.v1
    );

    if (!getResponse.ok) {
      const responseText = await getResponse.text();
      throw new Error(responseText);
    }

    const listItem = await getResponse.json();

    // Merge updated fields with the list item
    const updatedFields = { ...listItem, ...fieldsToUpdate };

    const requestHeaders = {
      'X-HTTP-Method': 'MERGE',
      'IF-MATCH': listItem['@odata.etag'] || '*', // Use '*' if ETag is unknown
    };

    const postEndpoint = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`;

    // Post request to update the item
    return context.spHttpClient.post(
      postEndpoint,
      SPHttpClient.configurations.v1,
      {
        headers: requestHeaders,
        body: JSON.stringify(updatedFields),
      }
    );
  } catch (error) {
    console.error('Error updating list item:', error);
    throw error;
  }
};

export async function deleteSharePointListItem(
  /* eslint-disable @typescript-eslint/no-explicit-any */
  context: any,
  listTitle: string,
  filterField: string,
  filterValue: string
  /* eslint-enable @typescript-eslint/no-explicit-any */
): Promise<SPHttpClientResponse> {
  // Fetch the list item based on the filter criteria
  const endpoint = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listTitle}')/items?$select=Id&$filter=${filterField} eq '${filterValue}'`;

  const getResponse = await context.spHttpClient.get(
    endpoint,
    SPHttpClient.configurations.v1
  );

  if (!getResponse.ok) {
    const responseText = await getResponse.text();
    throw new Error(responseText);
  }

  const responseJson = await getResponse.json();
  const listItem = responseJson.value[0];

  if (!listItem) {
    throw new Error(`Item with ${filterField} "${filterValue}" not found.`);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const request: any = {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    headers: {
      'X-HTTP-Method': 'DELETE',
      'IF-MATCH': '*',
    },
  };

  // DELETE endpoint for the specific item
  const deleteEndpoint = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listTitle}')/items(${listItem.Id})`;

  return context.spHttpClient.post(
    deleteEndpoint,
    SPHttpClient.configurations.v1,
    request
  );
}
