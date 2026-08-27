import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'
import remarkGfm from 'remark-gfm'

const Dashboard = () => {
  const chat = useChat()
  const [chatInput, setChatInput] = useState('')
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  const handleSubmitMessage = (event) => {
    event.preventDefault()
    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) return

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    setChatInput('')
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
  }

  const activeMessages = chats[currentChatId]?.messages || []
  const hasMessages = activeMessages.length > 0

  return (
    <main className='relative flex h-screen w-full bg-[#030305] text-zinc-200 overflow-hidden font-sans select-none'>
      {/* Deep Space Obsidian Ambient Lighting */}
      <div className='absolute top-[-10%] left-1/2 -translate-x-1/2 h-[550px] w-[750px] rounded-full bg-gradient-to-b from-zinc-500/10 via-zinc-800/5 to-transparent blur-[120px] pointer-events-none' />
      <div className='absolute bottom-[-10%] left-1/4 h-[400px] w-[500px] rounded-full bg-zinc-900/40 blur-[140px] pointer-events-none' />
      
      {/* Concentric Orbit Rings */}
      <div className='absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] pointer-events-none' />
      <div className='absolute left-1/2 top-1/2 h-[1300px] w-[1300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.015] pointer-events-none' />

      <section className='relative z-10 flex h-full w-full max-w-[1700px] mx-auto p-4 md:p-6 gap-6'>
        
        {/* Sidebar */}
        <aside className='hidden md:flex w-72 shrink-0 flex-col rounded-3xl bg-zinc-950/40 border border-white/[0.06] backdrop-blur-3xl p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'>
          <div className='flex items-center gap-3 mb-8 px-2'>
            <div className='h-8 w-8 rounded-xl bg-gradient-to-tr from-zinc-400 to-white p-[1px] shadow-[0_0_15px_rgba(255,255,255,0.2)]'>
              <div className='h-full w-full bg-black rounded-[11px] flex items-center justify-center'>
                <span className='text-xs font-bold text-white tracking-widest'>PX</span>
              </div>
            </div>
            <h1 className='text-sm font-semibold tracking-widest uppercase text-zinc-300'>Perplexity</h1>
          </div>

          <div className='flex-1 space-y-1.5 overflow-y-auto pr-1'>
            {Object.values(chats).map((chatObj, index) => {
              const isActive = chatObj.id === currentChatId
              return (
                <button
                  key={index}
                  onClick={() => openChat(chatObj.id)}
                  type='button'
                  className={`w-full group relative flex items-center rounded-2xl px-4 py-3 text-left text-xs font-medium tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'bg-zinc-800/50 text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                  }`}
                >
                  {isActive && (
                    <span className='absolute left-1.5 h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]' />
                  )}
                  <span className={`truncate w-full ${isActive ? 'pl-2' : ''}`}>{chatObj.title}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main Interface Area */}
        <section className='relative flex h-full min-w-0 flex-1 flex-col justify-between'>
          
          {/* Messages or Initial Animation */}
          <div className='messages relative flex-1 overflow-y-auto px-4 pb-40 pt-4'>
            {!hasMessages ? (
              /* Initial State Animation */
              <div className='flex h-full flex-col items-center justify-center gap-6 animate-fade-in'>
                {/* Glowing Core / Aurora Orb */}
                <div className='relative flex items-center justify-center'>
                  <div className='absolute h-28 w-28 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-purple-500/20 blur-2xl animate-pulse' />
                  <div className='relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-zinc-900/80 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.15)]'>
                    <div className='h-4 w-4 rounded-full bg-white animate-ping opacity-75' />
                    <div className='absolute h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_#fff]' />
                  </div>
                </div>

                {/* Shimmer Ambient Text */}
                <div className='text-center space-y-2'>
                  <h2 className='text-2xl md:text-3xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-400'>
                    Where should we begin?
                  </h2>
                  <p className='text-xs md:text-sm font-light tracking-widest text-zinc-500 uppercase'>
                    Ready to explore • Type a message below
                  </p>
                </div>
              </div>
            ) : (
              /* Message Thread */
              <div className='space-y-8'>
                {activeMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[70%] select-text text-sm md:text-[15px] leading-relaxed ${
                      message.role === 'user'
                        ? 'ml-auto rounded-3xl rounded-tr-md bg-gradient-to-b from-zinc-800/60 to-zinc-900/80 border border-white/10 px-6 py-4 text-zinc-100 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
                        : 'mr-auto px-2 py-4 text-zinc-300'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className='font-normal text-zinc-200'>{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className='mb-4 last:mb-0 font-light text-zinc-300 leading-7'>{children}</p>,
                          ul: ({ children }) => <ul className='mb-4 list-disc pl-5 space-y-2 text-zinc-400'>{children}</ul>,
                          ol: ({ children }) => <ol className='mb-4 list-decimal pl-5 space-y-2 text-zinc-400'>{children}</ol>,
                          code: ({ children }) => (
                            <code className='rounded-lg bg-zinc-900/80 border border-white/5 px-2 py-1 text-xs font-mono text-zinc-200'>
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className='mb-4 overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/60 p-4 font-mono text-xs backdrop-blur-sm'>
                              {children}
                            </pre>
                          )
                        }}
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Island Floating Input Console */}
          <footer className='absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4'>
            <form 
              onSubmit={handleSubmitMessage} 
              className='relative flex items-center gap-3 rounded-full bg-zinc-950/70 border border-white/15 backdrop-blur-3xl p-2 pl-6 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)]'
            >
              <input
                type='text'
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder='Ask anything...'
                className='flex-1 bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none font-light'
              />
              
              <button
                type='submit'
                disabled={!chatInput.trim()}
                className='group relative flex items-center justify-center rounded-full bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-400 px-7 py-3 text-xs font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-20 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              >
                Send
              </button>
            </form>
          </footer>

        </section>
      </section>
    </main>
  )
}

export default Dashboard