import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector, useDispatch } from 'react-redux'
import remarkGfm from 'remark-gfm'
import { FishSymbol, Send, Sparkles, Square, ImagePlus, X, Plus, FileText, ImageIcon, Paperclip, RotateCcw } from 'lucide-react'


// Hooks & Actions
import { useChat } from '../hooks/useChat'
import { useAuth } from '../../auth/hook/useAuth'
import { setCurrentChatId } from '../chat.slice'
import CodeBlock from '../components/CodeBlock'

const MODES = [
  { id: 'signal', label: 'Signal', description: 'Short, precise, only the facts' },
  { id: 'context', label: 'Context', description: 'Direct answer with useful context' },
  { id: 'deep', label: 'Deep Dive', description: 'Thorough, in-depth explanation' },
]

const PLACEHOLDER_PHRASES = [
  'How can I help you today?',
  'Ask anything get a straight answer...',
  'mujhe Ajmer se Jaipur jana hai, kaise jaun?',
  'Summarize this PDF for me...',
  'Explain this code in simple terms...',
]

const Dashboard = () => {
  // ==========================================
  // 1. HOOKS & GLOBAL STATE
  // ==========================================
  const dispatch = useDispatch()
  const chat = useChat()
  const { handleLogout } = useAuth()

  const user = useSelector((state) => state.auth.user)
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  // ==========================================
  // 2. LOCAL COMPONENT STATE
  // ==========================================
  const [chatInput, setChatInput] = useState('')
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [pendingMessage, setPendingMessage] = useState(null)
  const [pendingImage, setPendingImage] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [sendError, setSendError] = useState(null)

  // UI Panels & Controls
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 768
  )
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [editingChatId, setEditingChatId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [mode, setMode] = useState('signal')
  const [isModeOpen, setIsModeOpen] = useState(false)
  const [attachedImage, setAttachedImage] = useState(null)
  const [attachedFile, setAttachedFile] = useState(null)
  const [imageError, setImageError] = useState(null)
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false)

  // ==========================================
  // 3. DOM & ENGINE REFS
  // ==========================================
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const sendingRef = useRef(false)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const docInputRef = useRef(null)
  const attachMenuRef = useRef(null)
  const profileRef = useRef(null)
  const modeRef = useRef(null)

  const activeMessages = (currentChatId && chats[currentChatId]?.messages) || []
  const hasMessages = activeMessages.length > 0 || isSending

  // ==========================================
  // 4. SIDE EFFECTS
  // ==========================================
  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

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

  useEffect(() => {
    if (!isProfileOpen) return
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileOpen])

  useEffect(() => {
    if (!isModeOpen) return
    const handleClickOutside = (event) => {
      if (modeRef.current && !modeRef.current.contains(event.target)) {
        setIsModeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isModeOpen])

  useEffect(() => {
    if (!isAttachMenuOpen) return
    const handleClickOutside = (event) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setIsAttachMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAttachMenuOpen])

  useEffect(() => {
    if (chatInput) return

    let phraseIndex = 0
    let charIndex = 0
    let isDeleting = false
    let timeoutId

    const TYPE_SPEED = 45
    const DELETE_SPEED = 25
    const PAUSE_AFTER_TYPE = 1600
    const PAUSE_AFTER_DELETE = 300

    const tick = () => {
      const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex]

      if (!isDeleting) {
        charIndex++
        setAnimatedPlaceholder(currentPhrase.slice(0, charIndex))
        if (charIndex === currentPhrase.length) {
          isDeleting = true
          timeoutId = setTimeout(tick, PAUSE_AFTER_TYPE)
          return
        }
        timeoutId = setTimeout(tick, TYPE_SPEED)
      } else {
        charIndex--
        setAnimatedPlaceholder(currentPhrase.slice(0, charIndex))
        if (charIndex === 0) {
          isDeleting = false
          phraseIndex = (phraseIndex + 1) % PLACEHOLDER_PHRASES.length
          timeoutId = setTimeout(tick, PAUSE_AFTER_DELETE)
          return
        }
        timeoutId = setTimeout(tick, DELETE_SPEED)
      }
    }

    timeoutId = setTimeout(tick, 400)

    return () => clearTimeout(timeoutId)
  }, [chatInput])

  // ==========================================
  // 5. EVENT HANDLERS
  // ==========================================
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  const handleNewSession = () => {
    dispatch(setCurrentChatId(null))
    setChatInput('')
    setSendError(null)
    closeSidebarOnMobile()
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
    closeSidebarOnMobile()
  }

  const handleDeleteChat = async (event, chatId) => {
    event.stopPropagation()
    const confirmed = window.confirm('Delete this session?')
    if (!confirmed) return
    try {
      await chat.handleDeleteChat(chatId)
    } catch (err) { }
  }

  const startRenaming = (event, chatObj) => {
    event.stopPropagation()
    setEditingChatId(chatObj.id)
    setEditTitle(chatObj.title || 'Untitled Session')
  }

  const cancelRenaming = () => {
    setEditingChatId(null)
    setEditTitle('')
  }

  const submitRename = async (chatId) => {
    const trimmedTitle = editTitle.trim()
    const originalChat = chats[chatId]

    if (!trimmedTitle || trimmedTitle === originalChat?.title) {
      cancelRenaming()
      return
    }

    try {
      await chat.handleRenameChat(chatId, trimmedTitle)
    } catch (err) { }
    cancelRenaming()
  }

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSubmitMessage = async (event, customMsg = null) => {
    if (event) event.preventDefault()
    const msgToSend = (customMsg || chatInput).trim()
    if ((!msgToSend && !attachedImage && !attachedFile) || sendingRef.current) return

    const imageToSend = attachedImage
    const fileToSend = attachedFile

    const controller = new AbortController()
    abortControllerRef.current = controller

    sendingRef.current = true
    setSendError(null)
    setPendingMessage(msgToSend)
    setPendingImage(imageToSend)
    setPendingFile(fileToSend)
    setChatInput('')
    setAttachedImage(null)
    setAttachedFile(null)
    setIsSending(true)

    try {
      await chat.handleSendMessage({ message: msgToSend, chatId: currentChatId, signal: controller.signal, mode, image: imageToSend, file: fileToSend })
    } catch (err) {
      if (err.code !== 'ERR_CANCELED') {
        setSendError('Engine connection interrupted. Retry query.')
        setChatInput(msgToSend)
        setAttachedImage(imageToSend)
        setAttachedFile(fileToSend)
      }
    } finally {
      abortControllerRef.current = null
      sendingRef.current = false
      setIsSending(false)
      setPendingMessage(null)
      setPendingImage(null)
      setPendingFile(null)
    }
  }

  const MAX_IMAGE_BYTES = 4 * 1024 * 1024

  const processImageFile = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Only image files are supported.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image is too large (max 4MB).')
      return
    }

    setImageError(null)
    const reader = new FileReader()
    reader.onload = () => setAttachedImage(reader.result)
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    processImageFile(file)
  }

  const MAX_DOC_BYTES = 6 * 1024 * 1024
  const ALLOWED_DOC_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]

  const processDocFile = (file) => {
    if (!file) return

    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      setImageError('Only PDF, DOCX, and TXT files are supported.')
      return
    }
    if (file.size > MAX_DOC_BYTES) {
      setImageError('File is too large (max 6MB).')
      return
    }

    setImageError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setAttachedFile({ name: file.name, type: file.type, data: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handlePaste = (event) => {
    const pastedFiles = event.clipboardData?.files
    if (pastedFiles && pastedFiles.length > 0) {
      const file = pastedFiles[0]
      event.preventDefault()
      if (file.type.startsWith('image/')) {
        processImageFile(file)
      } else if (ALLOWED_DOC_TYPES.includes(file.type)) {
        processDocFile(file)
      } else {
        setImageError('This file type is not supported. Try an image, PDF, DOCX, or TXT.')
      }
      return
    }

    const items = event.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          event.preventDefault()
          processImageFile(file)
        }
        break
      }
    }
  }

  const removeAttachedImage = () => {
    setAttachedImage(null)
    setImageError(null)
  }

  const handleDocFileSelect = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    processDocFile(file)
  }

  const removeAttachedFile = () => {
    setAttachedFile(null)
    setImageError(null)
  }

  const handleStopGenerating = () => {
    abortControllerRef.current?.abort()
  }

  const handleRegenerateMessage = async () => {
    if (!currentChatId || sendingRef.current) return

    const controller = new AbortController()
    abortControllerRef.current = controller

    sendingRef.current = true
    setSendError(null)
    setIsSending(true)

    try {
      await chat.handleRegenerateMessage({ chatId: currentChatId, mode, signal: controller.signal })
    } catch (err) {
      if (err.code !== 'ERR_CANCELED') {
        setSendError('Could not regenerate response. Please try again.')
      }
    } finally {
      abortControllerRef.current = null
      sendingRef.current = false
      setIsSending(false)
    }
  }

  const filteredChats = Object.values(chats).filter((chatObj) =>
    (chatObj.title || 'Untitled Session').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ==========================================
  // 6. RENDER
  // ==========================================
  return (
    <main className="relative flex h-screen w-full bg-[#040507] text-zinc-100 overflow-hidden font-sans select-none">

      {/* ================= INLINE ANIMATIONS ================= */}
      <style>{`
        @keyframes dynamicSilverGlow {
          0%, 100% { opacity: 0.35; transform: scale(0.95); filter: blur(90px); }
          50% { opacity: 0.75; transform: scale(1.12); filter: blur(110px); }
        }
        .animate-silver-ambient {
          animation: dynamicSilverGlow 6s ease-in-out infinite;
        }

        /* Continuous Rotating Border Beam */
        @keyframes rotateBeam {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-beam-spin {
        animation: rotateBeam 6s linear infinite;
        }

      @keyframes loadingBounce {
        0 %, 60 %, 100 % { transform: translateY(0); opacity: 0.45; }
          30% {transform: translateY(-5px); opacity: 1; }
        }
      .loading-bounce {
        animation: loadingBounce 1.1s ease-in-out infinite;
        }

      @keyframes sparkleSpin {
        0 % { transform: rotate(0deg) scale(1); }
          50% {transform: rotate(180deg) scale(1.15); }
      100% {transform: rotate(360deg) scale(1); }
        }
      .sparkle-spin {
        animation: sparkleSpin 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Core Silver Fog Backdrop */}
      {
        !hasMessages && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="animate-silver-ambient absolute h-[580px] w-[900px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18)_0%,rgba(160,165,180,0.06)_45%,transparent_75%)]" />
            <div className="animate-silver-ambient absolute h-[280px] w-[450px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35)_0%,rgba(200,205,220,0.06)_50%,transparent_70%)]" style={{ animationDelay: '-3s' }} />
          </div>
        )
      }

      {/* Reopen Sidebar Floating Trigger */}
      {
        !isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-5 top-5 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-950/80 text-zinc-400 backdrop-blur-xl transition hover:border-white/20 hover:text-white cursor-pointer shadow-xl"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M9 3v18" />
            </svg>
          </button>
        )
      }

      {/* Main Workspace Layout */}
      {
        isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )
      }

      <div className="relative z-10 flex h-full w-full">

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-full w-[280px] shrink-0 flex-col bg-[#08090C] border-r border-white/[0.08] p-4 transition-transform duration-300 ease-in-out md:relative md:z-auto md:transition-[width] md:duration-300 md:translate-x-0 ${isSidebarOpen
            ? 'translate-x-0 md:w-[280px]'
            : '-translate-x-full md:w-0 md:p-0 md:border-0 md:overflow-hidden'
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 px-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 shadow-sm">
                <FishSymbol className="h-4 w-4 text-zinc-100" />
              </div>
              <span
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                className="text-base font-semibold tracking-[-0.02em] text-white"
              >
                Elix<span className="text-zinc-500 font-light">.ai</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-zinc-400">
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg hover:bg-white/[0.06] hover:text-zinc-200 transition cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-white/[0.06] hover:text-zinc-200 transition cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Search */}
          {showSearch && (
            <div className="mb-3 px-1 animate-fade-in">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-white/20"
              />
            </div>
          )}

          {/* New Session Button */}
          <button
            type="button"
            onClick={handleNewSession}
            className="group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/15 text-sm font-medium text-zinc-200 transition mb-5 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-base text-zinc-400 group-hover:text-white transition-colors">+</span>
              <span>New Session</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">⌘K</span>
          </button>

          {/* Section Heading */}
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-medium tracking-wider uppercase text-zinc-500">History</span>
          </div>

          {/* Sessions List */}
          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {filteredChats.map((chatObj, index) => {
              const isActive = chatObj.id === currentChatId
              const isEditing = editingChatId === chatObj.id
              return (
                <div
                  key={index}
                  onClick={() => !isEditing && openChat(chatObj.id)}
                  role="button"
                  tabIndex={0}
                  className={`group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${isEditing ? '' : 'cursor-pointer'} ${isActive
                    ? 'bg-white/[0.08] text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => submitRename(chatObj.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); submitRename(chatObj.id) }
                        if (e.key === 'Escape') { e.preventDefault(); cancelRenaming() }
                      }}
                      autoFocus
                      className="flex-1 min-w-0 rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-sm text-white outline-none"
                    />
                  ) : (
                    <>
                      <span className="truncate flex-1 tracking-normal">{chatObj.title || 'Untitled Session'}</span>
                      <button
                        type="button"
                        onClick={(e) => startRenaming(e, chatObj)}
                        className="shrink-0 rounded-lg p-1 text-zinc-500 opacity-0 transition hover:bg-white/[0.08] hover:text-zinc-200 group-hover:opacity-100 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteChat(e, chatObj.id)}
                        className="shrink-0 rounded-lg p-1 text-zinc-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Profile Bar */}
          <div ref={profileRef} className="relative mt-3 border-t border-white/[0.08] pt-3">
            {isProfileOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => { setIsProfileOpen(false); handleLogout() }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Log out
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsProfileOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-white/[0.05] cursor-pointer transition"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-zinc-200 to-zinc-400 text-xs font-bold text-black shadow-inner">
                {(user?.username || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-zinc-200">{user?.username || 'Account'}</p>
                <p className="truncate text-[11px] text-zinc-500">{user?.email || 'Connected'}</p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ================= MAIN INTERFACE ================= */}
        <section className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-between">

          {/* Top Status */}
          <div className="w-full flex items-center justify-end px-6 py-4 z-30">
            <span className="text-[10px] font-semibold text-zinc-500 tracking-[0.2em] uppercase">SECURE ENCLAVE</span>
          </div>

          {/* Messages Feed */}
          {hasMessages ? (
            <div className="messages flex-1 w-full max-w-4xl space-y-6 overflow-y-auto px-4 md:px-8 pb-36 pt-2">
              {activeMessages.map((message, index) => (
                <div
                  key={index}
                  className={`group flex flex-col text-[15px] leading-relaxed ${message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                >
                  <div
                    className={`rounded-3xl transition-all ${message.role === 'user'
                      ? 'ml-auto max-w-[78%] bg-zinc-800/80 border border-white/10 text-zinc-100 px-6 py-4 rounded-br-sm backdrop-blur-md'
                      : 'mr-auto max-w-[88%] bg-transparent text-zinc-200 px-2 py-2 w-full'
                      }`}
                  >
                    {message.role === 'user' ? (
                      <div className="space-y-2">
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Attached"
                            className="max-h-64 w-full rounded-2xl border border-white/10 object-cover"
                          />
                        )}
                        {message.fileName && (
                          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                            <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                            <span className="truncate text-xs text-zinc-300">{message.fileName}</span>
                          </div>
                        )}
                        {message.content && <p>{message.content}</p>}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="mb-3 mt-5 first:mt-0 text-xl font-semibold tracking-tight text-white">{children}</h1>,
                            h2: ({ children }) => <h2 className="mb-2.5 mt-5 first:mt-0 text-lg font-semibold tracking-tight text-white">{children}</h2>,
                            h3: ({ children }) => <h3 className="mb-2 mt-4 first:mt-0 text-base font-semibold text-white">{children}</h3>,
                            h4: ({ children }) => <h4 className="mb-2 mt-3 first:mt-0 text-sm font-semibold uppercase tracking-wide text-zinc-300">{children}</h4>,
                            p: ({ children }) => <p className="mb-3 last:mb-0 font-normal leading-relaxed text-zinc-200">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
                            ul: ({ children }) => <ul className="mb-3 list-disc pl-5 space-y-1.5 text-zinc-300 marker:text-zinc-500">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-3 list-decimal pl-5 space-y-1.5 text-zinc-300 marker:text-zinc-500">{children}</ol>,
                            li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
                            blockquote: ({ children }) => (
                              <blockquote className="mb-3 border-l-2 border-white/20 pl-4 italic text-zinc-400">{children}</blockquote>
                            ),
                            hr: () => <hr className="my-4 border-white/10" />,
                            a: ({ children, href }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">
                                {children}
                              </a>
                            ),
                            table: ({ children }) => (
                              <div className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-zinc-950/80 p-1">
                                <table className="w-full text-left text-xs text-zinc-300 border-collapse">{children}</table>
                              </div>
                            ),
                            th: ({ children }) => <th className="border-b border-white/10 bg-white/[0.04] px-4 py-2.5 font-semibold text-white">{children}</th>,
                            td: ({ children }) => <td className="border-b border-white/5 px-4 py-2 text-zinc-300">{children}</td>,
                            code: ({ className, children }) => {
                              const match = /language-(\w+)/.exec(className || '')
                              const codeText = String(children).replace(/\n$/, '')

                              if (match) {
                                return <CodeBlock language={match[1]} code={codeText} />
                              }

                              return (
                                <code className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-mono text-zinc-200 border border-white/5">
                                  {children}
                                </code>
                              )
                            },
                            pre: ({ children }) => <>{children}</>
                          }}
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content}
                        </ReactMarkdown>

                        {/* Copy Action */}
                        <div className="flex items-center pt-1 text-zinc-500">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(message.content, index)}
                            className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/[0.06] hover:text-zinc-200 transition cursor-pointer"
                            title="Copy message"
                          >
                            {copiedIndex === index ? (
                              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            )}
                          </button>
                          {index === activeMessages.length - 1 && (
                            <button
                              type="button"
                              onClick={handleRegenerateMessage}
                              disabled={isSending}
                              className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/[0.06] hover:text-zinc-200 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                              title="Regenerate response"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(message.content, `user-${index}`)}
                      className="mt-1 flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/[0.06] hover:text-zinc-200 cursor-pointer"
                      title="Copy message"
                    >
                      {copiedIndex === `user-${index}` ? (
                        <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              ))}

              {(pendingMessage || pendingImage || pendingFile) && (
                <div className="max-w-[78%] w-fit ml-auto rounded-3xl rounded-br-sm bg-zinc-800/80 border border-white/10 px-6 py-4 text-zinc-100 backdrop-blur-md text-[15px] space-y-2">
                  {pendingImage && (
                    <img
                      src={pendingImage}
                      alt="Attached"
                      className="max-h-64 w-full rounded-2xl border border-white/10 object-cover"
                    />
                  )}
                  {pendingFile && (
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                      <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span className="truncate text-xs text-zinc-300">{pendingFile.name}</span>
                    </div>
                  )}
                  {pendingMessage && <p>{pendingMessage}</p>}
                </div>
              )}

              {isSending && (
                <div className="mr-auto flex items-center gap-2.5 px-2 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] border border-white/10">
                    <Sparkles className="sparkle-spin h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-400">Elix is thinking</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 loading-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 loading-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 loading-bounce" style={{ animationDelay: '0.3s' }} />
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : (
            /* Hero Stage */
            <div className="flex-1 flex flex-col items-center justify-center -mt-8 z-10 w-full max-w-4xl text-center px-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-zinc-900/60 px-3.5 py-1 mb-6 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-zinc-400">
                  Zero-Noise Architecture
                </span>
              </div>

              <h2
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                className="pb-2 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.035em] leading-[1.12] text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#E4E4E7_40%,#71717A_100%)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              >
                High Signal. Zero Noise.
              </h2>

              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-md font-light leading-relaxed tracking-[-0.01em]"
              >
                Instant answers, structured data, and zero conversational filler.
              </p>
            </div>
          )}

          {/* =================================================================== */}
          {/* 🌟 ANIMATED TRAVELING LASER BEAM INPUT CONSOLE (VIDEO EFFECT)      */}
          {/* =================================================================== */}
          <div className="w-full max-w-3xl px-4 pb-6 z-20">
            <div className="relative w-full group">

              {/* 1. Outer Soft Atmospheric Aura Glow */}
              <div className="absolute -inset-[2px] rounded-[30px] overflow-hidden pointer-events-none opacity-80 blur-xl transition-opacity group-focus-within:opacity-100">
                <div
                  className="animate-beam-spin absolute -inset-[150%] origin-center"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, #ff5722 15%, transparent 35%, #3b82f6 60%, #a855f7 75%, transparent 100%)'
                  }}
                />
              </div>

              {/* 2. Sharp 1px Traveling Border Rim */}
              <div className="absolute -inset-[1px] rounded-[26px] overflow-hidden pointer-events-none">
                <div
                  className="animate-beam-spin absolute -inset-[150%] origin-center"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, #ff7043 12%, transparent 30%, #60a5fa 55%, #c084fc 72%, transparent 100%)'
                  }}
                />
              </div>

              {/* 3. Main Glass Console Container */}
              <form
                onSubmit={handleSubmitMessage}
                className="relative flex flex-col w-full rounded-[25px] bg-[#090a0f]/90 backdrop-blur-2xl p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
              >
                {(attachedImage || attachedFile) && (
                  <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
                    {attachedImage && (
                      <div className="relative inline-block">
                        <img
                          src={attachedImage}
                          alt="Selected"
                          className="h-16 w-16 rounded-xl border border-white/10 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeAttachedImage}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-white/20 text-zinc-300 hover:text-white transition cursor-pointer"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {attachedFile && (
                      <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-3 pr-8">
                        <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span className="max-w-[160px] truncate text-xs text-zinc-300">{attachedFile.name}</span>
                        <button
                          type="button"
                          onClick={removeAttachedFile}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-white/20 text-zinc-300 hover:text-white transition cursor-pointer"
                          title="Remove file"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {/* Input Textarea */}
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitMessage(e)
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder={animatedPlaceholder}
                  disabled={isSending}
                  className="w-full resize-none bg-transparent px-3 py-1.5 text-sm md:text-[15px] text-zinc-100 placeholder:text-zinc-500 outline-none font-normal max-h-32 custom-scrollbar"
                />

                {/* Bottom Bar: Mode Tag & Action Button */}
                <div className="flex items-center justify-between pt-2.5 px-1 border-t border-white/[0.05] mt-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={docInputRef}
                      accept=".pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleDocFileSelect}
                      className="hidden"
                    />

                    <div ref={attachMenuRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setIsAttachMenuOpen((open) => !open)}
                        disabled={isSending}
                        className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                        title="Add photos & files"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {isAttachMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl">
                          <button
                            type="button"
                            onClick={() => { setIsAttachMenuOpen(false); fileInputRef.current?.click() }}
                            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:bg-white/[0.06] cursor-pointer"
                          >
                            <ImageIcon className="h-4 w-4 text-zinc-400" />
                            Photos
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsAttachMenuOpen(false); docInputRef.current?.click() }}
                            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:bg-white/[0.06] cursor-pointer"
                          >
                            <Paperclip className="h-4 w-4 text-zinc-400" />
                            Files
                          </button>
                        </div>
                      )}
                    </div>
                    <div ref={modeRef} className="relative flex items-center gap-2">

                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModeOpen((open) => !open)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-xl border border-white/[0.08] backdrop-blur-md hover:bg-white/[0.07] hover:text-zinc-200 transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{MODES.find((m) => m.id === mode)?.label}</span>
                      <svg className="w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {isModeOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl">
                        {MODES.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => { setMode(m.id); setIsModeOpen(false) }}
                            className="flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition hover:bg-white/[0.06] cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-100">{m.label}</p>
                              <p className="mt-0.5 text-[11px] text-zinc-500">{m.description}</p>
                            </div>
                            {mode === m.id && (
                              <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Circular Glow Send Trigger */}
                  {isSending ? (
                    <button
                      type="button"
                      onClick={handleStopGenerating}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.35)] border border-white/20"
                      title="Stop generating"
                    >
                      <Square className="w-3 h-3 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!chatInput.trim() && !attachedImage && !attachedFile}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white disabled:opacity-20 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/20"
                      title="Send message"
                    >
                      <Send className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  )}
                </div>
              </form>

            </div>

            {/* Error Telemetry */}
            {sendError && (
              <p className="mt-2 text-center text-xs text-red-400">{sendError}</p>
            )}
            {imageError && (
              <p className="mt-2 text-center text-xs text-red-400">{imageError}</p>
            )}
          </div>

        </section>
      </div>
    </main >
  )
}

export default Dashboard