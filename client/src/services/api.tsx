const DISCOGS_TOKEN = "IkPbcesBJLDkquHfVrwdGztFqFeSGZsNgkwMpFwK";

const DISCOGS_API_BASE_URL = "https://api.discogs.com";
const BACKEND_BASE_URL = "http://localhost:8000";

type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface DiscogsRequestOptions {
  token?: string;
  query?: QueryParams;
}

async function discogsRequest(
  path: string,
  { token = DISCOGS_TOKEN, query }: DiscogsRequestOptions = {}
): Promise<any> {
  const url = new URL(`${DISCOGS_API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      // Discogs format: "Discogs token=YOUR_TOKEN"
      Authorization: `Discogs token=${token}`,
      Accept: "application/vnd.discogs.v2+json",
    },
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(
      `Discogs request failed (${res.status} ${res.statusText}) for ${url.pathname}${
        bodyText ? `: ${bodyText}` : ""
      }`,
    );
  }

  return res.json();
}

interface FetchCollectionFoldersParams {
  username: string;
  token?: string;
}

export async function fetchCollectionFolders({
  username,
  token,
}: FetchCollectionFoldersParams): Promise<any> {
  if (!username) throw new Error("fetchCollectionFolders: username is required");
  return discogsRequest(`/users/${encodeURIComponent(username)}/collection/folders`, {
    token,
  });
}

interface FetchCollectionItemsByFolderParams {
  username: string;
  folderId?: number;
  page?: number;
  perPage?: number;
  token?: string;
}

export async function fetchCollectionItemsByFolder({
  username,
  folderId = 0,
  page = 1,
  perPage = 100,
  token,
}: FetchCollectionItemsByFolderParams): Promise<any> {
  if (!username) throw new Error("fetchCollectionItemsByFolder: username is required");

  return discogsRequest(
    `/users/${encodeURIComponent(username)}/collection/folders/${encodeURIComponent(
      String(folderId),
    )}/releases`,
    {
      token,
      query: { page, per_page: perPage, sort: "artist", sort_order: "asc" },
    },
  );
}

interface FetchAllCollectionItemsByFolderParams {
  username: string;
  folderId?: number;
  perPage?: number;
  token?: string;
}

export async function fetchAllCollectionItemsByFolder({
  username,
  folderId = 0,
  perPage = 100,
  token,
}: FetchAllCollectionItemsByFolderParams): Promise<any[]> {
  const first = await fetchCollectionItemsByFolder({
    username,
    folderId,
    page: 1,
    perPage,
    token,
  });

  const releases = Array.isArray(first.releases) ? [...first.releases] : [];
  const totalPages = first?.pagination?.pages ?? 1;

  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchCollectionItemsByFolder({
      username,
      folderId,
      page,
      perPage,
      token,
    });
    if (Array.isArray(next.releases)) releases.push(...next.releases);
  }

  return releases;
}

interface BackendRequestOptions {
  query?: QueryParams;
}

async function backendRequest(
  path: string,
  { query }: BackendRequestOptions = {}
): Promise<any> {
  const url = new URL(`${BACKEND_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(
      `Backend request failed (${res.status} ${res.statusText}) for ${url.pathname}${
        bodyText ? `: ${bodyText}` : ""
      }`,
    );
  }
  return res.json();
}

interface FetchCollectionFromBackendParams {
  username: string;
  folderId?: number;
  perPage?: number;
}

export async function fetchCollectionFromBackend({
  username,
  folderId = 0,
  perPage = 100,
}: FetchCollectionFromBackendParams): Promise<any[]> {
  if (!username) throw new Error("fetchCollectionFromBackend: username is required");

  const data = await backendRequest(`/api/discogs/collection/folders/${encodeURIComponent(String(folderId))}/releases`, {
    query: { username, per_page: perPage },
  });

  return Array.isArray(data?.releases) ? data.releases : [];
}
