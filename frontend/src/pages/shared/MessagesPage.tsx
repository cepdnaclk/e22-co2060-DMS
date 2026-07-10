import { useEffect, useMemo, useState } from 'react';
import { MessageCircleMore, Paperclip, SendHorizonal, Search, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, messagesAPI } from '../../api';
import type { User, MessageDTO } from '../../types';

type Message = {
  id: number;
  senderId: number;
  text: string;
  time: string;
};

type ChatThread = {
  id: string;
  participants: number[];
  messages: Message[];
  updatedAt: string;
};

const getThreadId = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'U';

const groupMessagesIntoThreads = (currentUserId: number, dbMsgs: MessageDTO[]): ChatThread[] => {
  const groups: { [counterpartId: number]: MessageDTO[] } = {};
  for (const msg of dbMsgs) {
    const counterpartId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
    if (!groups[counterpartId]) {
      groups[counterpartId] = [];
    }
    groups[counterpartId].push(msg);
  }
  
  return Object.entries(groups).map(([cIdStr, msgList]) => {
    const counterpartId = Number(cIdStr);
    return {
      id: getThreadId(currentUserId, counterpartId),
      participants: [currentUserId, counterpartId],
      messages: msgList.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      })),
      updatedAt: msgList[msgList.length - 1]?.createdAt || new Date().toISOString(),
    };
  });
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;

      try {
        const { data } = await usersAPI.getAll();
        const others = (data || []).filter((item: User) => item.id !== user.id);
        setAllUsers(others);
      } catch {
        setAllUsers([]);
      }

      try {
        const { data: dbMsgs } = await messagesAPI.getMessages();
        const loadedThreads = groupMessagesIntoThreads(user.id, dbMsgs || []);
        setThreads(loadedThreads);
        if (loadedThreads[0]) {
          setActiveThreadId(loadedThreads[0].id);
        }
      } catch {
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user]);

  const userLookup = useMemo(() => Object.fromEntries(allUsers.map((person) => [person.id, person])), [allUsers]);

  const visibleThreads = useMemo(() => {
    if (!user) return [];
    return threads
      .filter((thread) => thread.participants.includes(user.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [threads, user]);

  const activeThread = useMemo(() => {
    if (!visibleThreads.length) return null;
    return visibleThreads.find((thread) => thread.id === activeThreadId) ?? visibleThreads[0];
  }, [activeThreadId, visibleThreads]);

  const activeParticipant = useMemo(() => {
    if (!user || !activeThread) return null;
    const otherId = activeThread.participants.find((id) => id !== user.id);
    return otherId ? userLookup[otherId] ?? null : null;
  }, [activeThread, user, userLookup]);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return allUsers.filter((person) => {
      const name = `${person.fullName || ''} ${person.username || ''}`.toLowerCase();
      return name.includes(term) || person.role.toLowerCase().includes(term);
    });
  }, [allUsers, searchTerm]);

  const startChat = (person: User) => {
    if (!user) return;
    const threadId = getThreadId(user.id, person.id);
    const existing = threads.find((thread) => thread.id === threadId);

    if (existing) {
      setActiveThreadId(existing.id);
      setSearchTerm('');
      return;
    }

    const newThread: ChatThread = {
      id: threadId,
      participants: [user.id, person.id],
      messages: [],
      updatedAt: new Date().toISOString(),
    };

    setThreads([newThread, ...threads]);
    setActiveThreadId(newThread.id);
    setSearchTerm('');
  };

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !user || !activeThread) return;

    const otherId = activeThread.participants.find((id) => id !== user.id);
    if (!otherId) return;

    try {
      const { data: sentMessage } = await messagesAPI.sendMessage({
        receiverId: otherId,
        text: trimmed
      });

      const newMessage: Message = {
        id: sentMessage.id,
        senderId: sentMessage.senderId,
        text: sentMessage.text,
        time: new Date(sentMessage.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      };

      const updatedThreads = threads.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              messages: [...thread.messages, newMessage],
              updatedAt: sentMessage.createdAt,
            }
          : thread
      );

      setThreads(updatedThreads);
      setDraft('');
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <MessageCircleMore className="w-6 h-6 text-blue-400" /> Messages
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Start a chat with another user and keep the conversation saved for later.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
            <Sparkles className="w-4 h-4" /> Shared conversations
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl">
          <div className="grid min-h-[70vh] lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-white/10 bg-slate-900/70 p-4 lg:border-b-0 lg:border-r">
              <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users to chat"
                    className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1 rounded-xl border border-white/10 bg-slate-950/70 p-2">
                    {searchResults.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => startChat(person)}
                        className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm text-gray-200 hover:bg-white/10"
                      >
                        <span>{person.fullName || person.username}</span>
                        <Plus className="w-4 h-4 text-blue-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                    Loading chats...
                  </div>
                ) : visibleThreads.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                    No chats yet. Search a user to start one.
                  </div>
                ) : visibleThreads.map((thread) => {
                  const otherId = thread.participants.find((id) => id !== user.id);
                  const otherUser = otherId ? userLookup[otherId] : null;
                  const isActive = thread.id === activeThread?.id;
                  const lastMessage = thread.messages[thread.messages.length - 1];

                  return (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                        isActive ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-semibold text-white">
                        {getInitials(otherUser?.fullName || otherUser?.username || 'User')}
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-white">{otherUser?.fullName || otherUser?.username || 'User'}</p>
                          {lastMessage && <span className="text-[11px] text-gray-500">{lastMessage.time}</span>}
                        </div>
                        <p className="truncate text-sm text-gray-400">{otherUser?.role || 'User'}</p>
                        <p className="truncate text-sm text-gray-500">{lastMessage?.text || 'Start a conversation'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex flex-col">
              {activeParticipant ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-semibold text-white">
                        {getInitials(activeParticipant.fullName || activeParticipant.username || 'User')}
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{activeParticipant.fullName || activeParticipant.username}</p>
                        <p className="text-sm text-gray-400">{activeParticipant.role} • Online</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)] p-4">
                    {activeThread?.messages.length ? (
                      activeThread.messages.map((message) => {
                        const isMine = message.senderId === user.id;
                        return (
                          <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                                isMine ? 'bg-blue-600 text-white' : 'border border-white/10 bg-slate-900/90 text-gray-200'
                              }`}
                            >
                              <p>{message.text}</p>
                              <p className={`mt-2 text-[11px] ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                                {message.time}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
                        Start the conversation by sending a message.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 bg-slate-900/80 p-4">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3">
                      <button className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={`Message ${activeParticipant.fullName || activeParticipant.username}...`}
                        className="flex-1 border-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                      />
                      <button
                        onClick={handleSend}
                        className="rounded-xl bg-blue-600 p-2 text-white transition hover:bg-blue-500"
                      >
                        <SendHorizonal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-400">
                  Search for another user to begin chatting.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
