/**
 * Minimal GitHub client for committing gallery changes.
 *
 * Every admin action becomes exactly one commit — photos and the updated
 * gallery.json together — so the site never deploys with a photo that the
 * manifest doesn't list, or the reverse (which would also fail the
 * frontend's check-images step).
 */
import { env } from "./env.js";

export class GitHubNotConfiguredError extends Error {}

/** Thrown when someone else moved the branch between our read and write. */
class StaleBranchError extends Error {}

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  if (!env.GITHUB_TOKEN) throw new GitHubNotConfiguredError();
  const res = await fetch(`${env.GITHUB_API_URL}/repos/${env.GITHUB_REPO}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 422 && path.startsWith("/git/refs/")) throw new StaleBranchError();
  if (!res.ok) {
    throw new Error(`GitHub ${init?.method ?? "GET"} ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function headSha(): Promise<string> {
  const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${env.GITHUB_BRANCH}`);
  return ref.object.sha;
}

export async function readFileAt(path: string, ref: string): Promise<string> {
  const file = await gh<{ content: string; encoding: string }>(
    `/contents/${path}?ref=${encodeURIComponent(ref)}`,
  );
  return Buffer.from(file.content, file.encoding as BufferEncoding).toString("utf8");
}

export type Change =
  | { path: string; content: Buffer }
  | { path: string; delete: true };

/**
 * Read files at the branch head, let `build` derive the changes from them,
 * and commit those changes on top of that head. An empty change list commits
 * nothing and just returns `result`. If the branch moved in between (a
 * second upload from another tab, or a push from a developer), start over
 * from the new head rather than overwrite it.
 */
export async function commitFromFiles<R>(
  paths: string[],
  build: (current: string[]) => { changes: Change[]; message: string; result: R },
): Promise<R> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const parent = await headSha();
    const current = await Promise.all(paths.map((p) => readFileAt(p, parent)));
    const { changes, message, result } = build(current);
    // Nothing to change (e.g. the item was already gone): no commit, no deploy.
    if (changes.length === 0) return result;

    const parentCommit = await gh<{ tree: { sha: string } }>(`/git/commits/${parent}`);

    const tree = await Promise.all(
      changes.map(async (c) => {
        if ("delete" in c) return { path: c.path, mode: "100644", type: "blob", sha: null };
        const blob = await gh<{ sha: string }>("/git/blobs", {
          method: "POST",
          body: JSON.stringify({ content: c.content.toString("base64"), encoding: "base64" }),
        });
        return { path: c.path, mode: "100644", type: "blob", sha: blob.sha };
      }),
    );

    const newTree = await gh<{ sha: string }>("/git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree }),
    });
    const commit = await gh<{ sha: string }>("/git/commits", {
      method: "POST",
      body: JSON.stringify({ message, tree: newTree.sha, parents: [parent] }),
    });

    try {
      await gh(`/git/refs/heads/${env.GITHUB_BRANCH}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
      return result;
    } catch (err) {
      if (!(err instanceof StaleBranchError)) throw err;
    }
  }
  throw new Error("GitHub branch kept moving; gave up after 3 attempts");
}

export async function readFileAtHead(path: string): Promise<string> {
  return readFileAt(path, await headSha());
}
