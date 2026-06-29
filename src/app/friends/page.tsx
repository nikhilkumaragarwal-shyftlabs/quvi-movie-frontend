"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { SectionTitle } from "@/components/movie-card";
import { ApiError, api, type FriendRequest, type FriendSummary } from "@/lib/api";

function displayName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export default function FriendsPage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [friendList, incomingList, outgoingList] = await Promise.all([
        api.friends(token),
        api.incomingFriendRequests(token),
        api.outgoingFriendRequests(token),
      ]);
      setFriends(friendList);
      setIncoming(incomingList);
      setOutgoing(outgoingList);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    load();
  }, [authLoading, token, router, load]);

  const onSendRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !email.trim()) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await api.sendFriendRequest(token, email.trim());
      setEmail("");
      setMessage("Friend request sent.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send request");
    } finally {
      setPending(false);
    }
  };

  const onAccept = async (requestId: string) => {
    if (!token) return;
    await api.acceptFriendRequest(token, requestId);
    await load();
  };

  const onReject = async (requestId: string) => {
    if (!token) return;
    await api.rejectFriendRequest(token, requestId);
    await load();
  };

  const onCancel = async (requestId: string) => {
    if (!token) return;
    await api.cancelFriendRequest(token, requestId);
    await load();
  };

  const onRemove = async (userId: string) => {
    if (!token) return;
    await api.removeFriend(token, userId);
    await load();
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted sm:px-6">
        Loading friends…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionTitle>Friends</SectionTitle>
      <p className="-mt-4 mb-8 text-sm text-muted">
        Add friends by email. You can only see what they watch after they accept your request.
      </p>

      <form onSubmit={onSendRequest} className="mb-10 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@email.com"
          required
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Sending…" : "Add friend"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {message && <p className="mb-4 text-sm text-gold">{message}</p>}

      {incoming.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Friend requests
          </h2>
          <ul className="space-y-3">
            {incoming.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div>
                  <p className="font-medium">{displayName(req.user)}</p>
                  <p className="text-xs text-muted">Wants to be friends</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAccept(req.id)}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(req.id)}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-accent hover:text-foreground"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outgoing.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Sent requests
          </h2>
          <ul className="space-y-3">
            {outgoing.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div>
                  <p className="font-medium">{displayName(req.user)}</p>
                  <p className="text-xs text-muted">Pending — waiting for them to accept</p>
                </div>
                <button
                  type="button"
                  onClick={() => onCancel(req.id)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-accent"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Your friends
        </h2>
        {friends.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
            No friends yet. Send a request — once they accept, you&apos;ll see their movie taste here.
          </p>
        ) : (
          <ul className="space-y-3">
            {friends.map((friend) => (
              <li
                key={friend.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/friends/${friend.id}`}
                      className="font-display text-lg font-bold text-foreground hover:text-gold"
                    >
                      {displayName(friend)}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {friend.ratedCount} rating{friend.ratedCount === 1 ? "" : "s"}
                    </p>
                    {friend.topGenres.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {friend.topGenres.map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full border border-border bg-elevated px-3 py-1 text-xs text-foreground"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(friend.id)}
                    className="text-xs text-muted hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
