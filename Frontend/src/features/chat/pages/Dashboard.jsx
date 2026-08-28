import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector, useDispatch } from 'react-redux'
import { useChat } from '../hooks/useChat'
import remarkGfm from 'remark-gfm'
import { setCurrentChatId } from '../chat.slice'

const Dashboard = () => {
  const dispatch = useDispatch()
  const chat = useChat()
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [pendingMessage, setPendingMessage] = useState(null)
  const [sendError, setSendError] = useState(null)
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  const messagesEndRef = useRef(null)
  const sendingRef = useRef(false)
  const inputRef = useRef(null)

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  const activeMessages = (currentChatId && chats[currentChatId]?.messages) || []
  const hasMessages = activeMessages.length > 0 || isSending

  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeMessages, hasMessages, isSending])

  useEffect(() => {
    if (!isSending) {
      inputRef.current?.focus()
    }
  }, [isSending])

  const handleNewSession = () => {
    dispatch(setCurrentChatId(null))
    setChatInput('')
    setSendError(null)
  }

  const handleSubmitMessage = async (event) => {
    event.preventDefault()
    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage || sendingRef.current) return   // ← ref check (React state nahi)

    sendingRef.current = true   // ← NEW: turant lock lagao
    setSendError(null)
    setPendingMessage(trimmedMessage)
    setChatInput('')
    setIsSending(true)

    try {
      await chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    } catch (err) {
      setSendError('Message could not be sent. Please try again.')
      setChatInput(trimmedMessage)
    } finally {
      sendingRef.current = false   // ← NEW: lock hatao
      setIsSending(false)
      setPendingMessage(null)
    }
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
  }

  return (
    <main className='relative flex h-screen w-full bg-[#040507] text-zinc-100 overflow-hidden font-sans select-none'>

      <style>{`
        @keyframes dynamicSilverGlow {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.94);
            filter: blur(80px);
          }
          50% {
            opacity: 0.78;
            transform: scale(1.10);
            filter: blur(95px);
          }
        }
        .animate-silver-ambient {
          animation: dynamicSilverGlow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot {
          animation: typingBounce 1.2s infinite ease-in-out;
        }
      `}</style>

      {!hasMessages && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-0'>
          <div className='animate-silver-ambient absolute h-[520px] w-[820px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.22)_0%,rgba(190,195,210,0.1)_40%,transparent_72%)]' />
          <div className='animate-silver-ambient absolute h-[260px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.32)_0%,rgba(210,215,225,0.08)_50%,transparent_70%)]' style={{ animationDelay: '-2.5s' }} />
        </div>
      )}

      <section className='relative z-10 flex h-full w-full max-w-[1650px] mx-auto p-4 md:p-6 gap-6'>

        <aside className='hidden md:flex w-72 shrink-0 flex-col rounded-3xl bg-zinc-950/70 border border-white/[0.07] backdrop-blur-2xl p-5 shadow-2xl'>
          <div className='flex items-center gap-3 mb-6 px-2 pt-1'>
            <div className='h-3.5 w-3.5 rounded-full bg-gradient-to-b from-white to-zinc-400 shadow-[0_0_12px_rgba(255,255,255,0.6)] ring-2 ring-white/10' />
            <h1 className='text-base font-semibold tracking-wide text-zinc-100'>Elix.ai</h1>
          </div>

          <button
            type='button'
            onClick={handleNewSession}
            className='group flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-xs font-medium text-zinc-200 transition-all duration-200 mb-6 shadow-sm active:scale-[0.98] cursor-pointer'
          >
            <span className='text-base leading-none text-zinc-400 group-hover:text-white transition-colors'>+</span>
            <span>New Session</span>
          </button>

          <div className='flex items-center justify-between px-2 mb-2'>
            <span className='text-[10px] font-semibold tracking-widest uppercase text-zinc-500'>Recent Sessions</span>
          </div>

          <div className='flex-1 space-y-1 overflow-y-auto pr-1'>
            {Object.values(chats).map((chatObj, index) => {
              const isActive = chatObj.id === currentChatId
              return (
                <button
                  key={index}
                  onClick={() => openChat(chatObj.id)}
                  type='button'
                  className={`group relative w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs transition-all duration-200 cursor-pointer ${isActive
                      ? 'bg-white/[0.08] text-white font-medium border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                    }`}
                >
                  {isActive && (
                    <div className='absolute left-1.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' />
                  )}

                  <svg
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-white pl-1' : 'text-zinc-500 group-hover:text-zinc-400'}`}
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' strokeLinecap='round' strokeLinejoin='round' />
                  </svg>

                  <span className='truncate flex-1 tracking-wide'>{chatObj.title || 'Untitled Session'}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <section className='relative flex h-full min-w-0 flex-1 flex-col items-center justify-between'>

          <div className='w-full flex items-center justify-end px-4 py-2 z-20'>
            {!hasMessages && <span className='text-[10px] font-semibold text-zinc-500 tracking-[0.2em]'>SECURE NETWORK</span>}
          </div>

          {hasMessages ? (
            <div className='messages flex-1 w-full space-y-6 overflow-y-auto px-4 md:px-12 pb-28 pt-4'>
              {activeMessages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[75%] w-fit text-[15px] leading-relaxed tracking-wide ${message.role === 'user'
                      ? 'ml-auto rounded-3xl rounded-br-sm bg-zinc-800/80 border border-white/5 px-6 py-4 text-zinc-100 backdrop-blur-md shadow-lg'
                      : 'mr-auto px-2 py-4 text-zinc-300'
                    }`}
                >
                  {message.role === 'user' ? (
                    <p>{message.content}</p>
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className='mb-4 last:mb-0 font-light leading-7'>{children}</p>,
                        ul: ({ children }) => <ul className='mb-4 list-disc pl-5 space-y-2 text-zinc-400'>{children}</ul>,
                        ol: ({ children }) => <ol className='mb-4 list-decimal pl-5 space-y-2 text-zinc-400'>{children}</ol>,
                        code: ({ children }) => <code className='rounded-md bg-white/10 px-1.5 py-0.5 text-sm font-mono text-zinc-200'>{children}</code>,
                        pre: ({ children }) => <pre className='mb-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-4 shadow-inner'>{children}</pre>
                      }}
                      remarkPlugins={[remarkGfm]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              ))}

              {pendingMessage && (
                <div className='max-w-[75%] w-fit ml-auto rounded-3xl rounded-br-sm bg-zinc-800/80 border border-white/5 px-6 py-4 text-zinc-100 backdrop-blur-md shadow-lg text-[15px] leading-relaxed tracking-wide'>
                  <p>{pendingMessage}</p>
                </div>
              )}

              {isSending && (
                <div className='mr-auto flex items-center gap-1.5 px-2 py-4'>
                  <span className='h-2 w-2 rounded-full bg-zinc-400 typing-dot' />
                  <span className='h-2 w-2 rounded-full bg-zinc-400 typing-dot' style={{ animationDelay: '0.15s' }} />
                  <span className='h-2 w-2 rounded-full bg-zinc-400 typing-dot' style={{ animationDelay: '0.3s' }} />
                </div>
              )}

              <div ref={messagesEndRef} className='h-4' />
            </div>
          ) : (
            <div className='flex-1 flex flex-col items-center justify-center -mt-16 z-10 w-full animate-fade-in text-center px-4'>
              <h2 className='text-3xl md:text-5xl font-medium tracking-tight text-white mb-4 drop-shadow-2xl'>
                Built for the Next<br />Generation of Chat.
              </h2>
              <p className='text-sm md:text-base text-zinc-400 max-w-lg font-light leading-relaxed mb-8'>
                A powerful digital identity created to bring trust, innovation, and simplicity to your workflow.
              </p>

              <form
                onSubmit={handleSubmitMessage}
                className='relative flex items-center w-full max-w-2xl rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-2xl p-2 pl-5 shadow-[0_15px_35px_rgba(0,0,0,0.9)] focus-within:border-white/25 transition-all'
              >
                <button type='button' className='p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer'>
                  <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M12 5v14M5 12h14' strokeLinecap='round' />
                  </svg>
                </button>

                <input
                  ref={inputRef}
                  type='text'
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder='Enter the New Era of AI...'
                  disabled={isSending}
                  className='flex-1 bg-transparent px-3 py-2 text-sm md:text-base text-zinc-100 placeholder:text-zinc-500 outline-none font-normal'
                />

                <div className='flex items-center'>
                  {chatInput.trim() ? (
                    <button
                      type='submit'
                      disabled={isSending}
                      className='flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-b from-zinc-200 to-zinc-400 text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer'
                    >
                      <svg className='w-4 h-4 fill-current' viewBox='0 0 24 24'>
                        <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
                      </svg>
                    </button>
                  ) : (
                    <button type='button' className='flex items-center justify-center h-10 w-10 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors'>
                      <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z' />
                        <path d='M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z' />
                      </svg>
                    </button>
                  )}
                </div>
              </form>

              {sendError && (
                <p className='mt-3 text-center text-xs text-red-400'>{sendError}</p>
              )}

              <div className='mt-8 text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-light'>
                Future-ready • Decentralized • Connected
              </div>
            </div>
          )}

          {hasMessages && (
            <div className='w-full max-w-3xl px-4 pb-2 z-20'>
              <form
                onSubmit={handleSubmitMessage}
                className='relative flex items-center w-full rounded-full bg-zinc-950/90 border border-white/10 backdrop-blur-2xl p-2 pl-5 shadow-[0_15px_35px_rgba(0,0,0,0.9)] focus-within:border-white/25 transition-all'
              >
                <button type='button' className='p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer'>
                  <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M12 5v14M5 12h14' strokeLinecap='round' />
                  </svg>
                </button>

                <input
                  ref={inputRef}
                  type='text'
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder='Type a message...'
                  disabled={isSending}
                  className='flex-1 bg-transparent px-3 py-2 text-sm md:text-base text-zinc-100 placeholder:text-zinc-500 outline-none font-normal disabled:opacity-50'
                />

                <button
                  type='submit'
                  disabled={!chatInput.trim() || isSending}
                  className='flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-b from-zinc-200 to-zinc-400 text-black disabled:opacity-20 transition-all cursor-pointer'
                >
                  <svg className='w-4 h-4 fill-current' viewBox='0 0 24 24'>
                    <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
                  </svg>
                </button>
              </form>

              {sendError && (
                <p className='mt-2 text-center text-xs text-red-400'>{sendError}</p>
              )}
            </div>
          )}

        </section>
      </section>
    </main>
  )
}

export default Dashboard