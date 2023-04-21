'use client';

import ClientHttp, { fetcher } from '@/http/http';
import { Chat, Message } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useLayoutEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRSubscription from 'swr/subscription';
import { PlusIcon } from './components/PlusIcon';
import { MessageIcon } from './components/MessageIcon';
import { ArrowRightIcon } from './components/ArrowRightIcon';
import { ChatItemError } from './components/chat/ChatItemError';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { ChatItem } from './components/chat/ChatItem';
import { LogoutIcon } from './components/LogoutIcon';
import { signOut } from 'next-auth/react';

marked.setOptions({
  highlight: function (code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
});

type ChatWithFirstMessage = Chat & {
  messages: [Message];
};

export default function Home() {
  const router = useRouter();
  const seachParams = useSearchParams();
  const chatIdParam = seachParams.get('id');

  const [chatId, setChatId] = useState(chatIdParam);
  const [messageId, setMessageId] = useState<string | null>(null);

  const { data: chats, mutate: mutateChats } = useSWR<ChatWithFirstMessage[]>(
    'chats',
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  );

  const { data: messages, mutate: mutateMessages } = useSWR<Message[]>(
    chatId ? `chats/${chatId}/messages` : null,
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  );

  const { data: messageLoading, error: errorMessageLoading } =
    useSWRSubscription(
      messageId ? `/api/messages/${messageId}/events` : null,
      (path: string, { next }) => {
        console.log('init event source');
        const eventSource = new EventSource(path);

        eventSource.onmessage = (event) => {
          console.log('data:', event);
          const newMessage = JSON.parse(event.data);
          next(null, newMessage.content);
        };
        eventSource.onerror = (event) => {
          console.log('error:', event);
          eventSource.close();
          //@ts-ignore
          next(JSON.parse(event.data), null);
        };
        eventSource.addEventListener('end', (event) => {
          console.log('end:', event);
          eventSource.close();
          const newMessage = JSON.parse(event.data);
          mutateMessages((messages) => [...messages!, newMessage], false);
          next(null, null);
        });

        return () => {
          console.log('close event source');
          eventSource.close();
        };
      }
    );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const textArea = event.currentTarget.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;
    const message = textArea.value;

    if (!chatId) {
      const newChat: ChatWithFirstMessage = await ClientHttp.post('chats', {
        message,
      });

      mutateChats([newChat, ...chats!], false);

      setChatId(newChat.id);
      setMessageId(newChat.messages[0].id);
    } else {
      const newMessage: Message = await ClientHttp.post(
        `chats/${chatId}/messages`,
        { message }
      );

      mutateMessages([...messages!, newMessage], false);
      setMessageId(newMessage.id);
    }

    textArea.value = '';
  }

  async function logout() {
    await signOut({ redirect: false });
    const { url: logoutUrl } = await ClientHttp.get(
      `logout-url?${new URLSearchParams({ redirect: window.location.origin })}`
    );
    window.location.href = logoutUrl;
  }

  useEffect(() => {
    setChatId(chatIdParam);
  }, [chatIdParam]);

  useEffect(() => {
    const textArea = document.querySelector(
      '#messageInput'
    ) as HTMLTextAreaElement;

    textArea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
      }
    });

    textArea.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        const form = document.querySelector('#form') as HTMLFormElement;
        const submitButton = form.querySelector('button') as HTMLButtonElement;
        form.requestSubmit(submitButton);
        return;
      }

      if (textArea.scrollHeight >= 200) {
        textArea.style.overflowY = 'scroll';
      } else {
        textArea.style.overflowY = 'hidden';
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
      }
    });
  }, []);

  useLayoutEffect(() => {
    if (!messageLoading) {
      return;
    }
    const chatting = document.querySelector('#chatting') as HTMLUListElement;
    chatting.scrollTop = chatting.scrollHeight;
  }, [messageLoading]);

  return (
    <div className="w-full h-full flex overflow-hidden">
      <div className="flex flex-col bg-gray-900 w-[300px] h-screen p-2">
        <button
          className="flex gap-3 items-center mb-1 p-3 border border-white/20 rounded hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer"
          type="button"
          onClick={() => {
            router.push('/');
            setChatId(null);
            setMessageId(null);
          }}
        >
          <PlusIcon className="w-5 h-5" />
          New chat
        </button>

        <ul className="overflow-y-auto overflow-hidden flex flex-col gap-2 flex-grow">
          {chats!.map((chat) => (
            <li key={chat.id} className="text-gray-100 text-sm mr-2">
              <button
                className="flex gap-3 item-center p-3 w-full hover:bg-[#3f4679] rounded cursor-pointer group"
                type="button"
                onClick={() => router.push(`/?id=${chat.id}`)}
              >
                <MessageIcon className="w-5 h-5" />
                <div className="relative overflow-hidden break-all w-full max-h-5 text-left">
                  {chat.messages[0].content}
                  <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-900 group-hover:from-[#3f4679]"></div>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <button
          className="flex p-3 mt-1 gap-3 rounded hover:bg-gray-500/10 text-sm text-white transition-colors duration-200"
          onClick={() => logout()}
        >
          <LogoutIcon className="h-5 w-5" />
          Log out
        </button>
      </div>

      <div className="flex-1 gap-3 relative">
        <ul
          id="chatting"
          className="h-screen overflow-y-auto bg-gray-800 pb-36"
        >
          {messages!.map((message) => (
            <ChatItem
              key={message.id}
              content={message.content}
              is_from_bot={message.is_from_bot}
            />
          ))}

          {messageLoading && (
            <ChatItem
              content={messageLoading}
              is_from_bot={true}
              loading={true}
            />
          )}

          {errorMessageLoading && (
            <ChatItemError>{errorMessageLoading}</ChatItemError>
          )}
        </ul>

        <div className="absolute w-full bottom-0 left-0 !bg-transparent bg-gradient-to-b from-gray-800 to-gray-950">
          <div className="mx-auto mb-6 max-w-3xl">
            <form id="form" onSubmit={onSubmit}>
              <div className="flex flex-col justify-center relative py-3 pl-4 mb-6 text-white bg-gray-700 rounded">
                <textarea
                  id="messageInput"
                  rows={1}
                  className="resize-none bg-transparent outline-none pr-14 pl-0"
                  placeholder="Digite sua pergunta"
                />

                <button
                  className="absolute bottom-2 right-0 md:right-4 text-gray-400 rounded hover:text-gray-400 hover:bg-gray-900"
                  type="submit"
                  disabled={messageLoading}
                >
                  <ArrowRightIcon className="w-8 text-white" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
