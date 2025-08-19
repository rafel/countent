'use client';

import {
  AIBranch,
  AIBranchMessages,
  AIBranchNext,
  AIBranchPage,
  AIBranchPrevious,
  AIBranchSelector,
} from '@/app/components/ui/ai/branch';
import {
  AIConversation,
  AIConversationContent,
} from '@/app/components/ui/ai/enhanced-conversation';
import { AIConversationScrollButton } from '@/app/components/ui/ai/conversation-scroll-button';
import {
  AIInput,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@/app/components/ui/ai/enhanced-input';
import { AIMessage, AIMessageAvatar, AIMessageContent } from '@/app/components/ui/ai/enhanced-message';
import {
  AIReasoning,
  AIReasoningContent,
  AIReasoningTrigger,
} from '@/app/components/ui/ai/ai-reasoning';
import { AIResponse } from '@/app/components/ui/ai/response';
import {
  AISource,
  AISources,
  AISourcesContent,
  AISourcesTrigger,
} from '@/app/components/ui/ai/ai-sources';
import { AISuggestion, AISuggestions } from '@/app/components/ui/ai/ai-suggestions';
import {
  AITool,
  AIToolContent,
  AIToolHeader,
  AIToolParameters,
  AIToolResult,
  type AIToolStatus,
} from '@/app/components/ui/ai/tool';
import {
  CameraIcon,
  FileIcon,
  GlobeIcon,
  ImageIcon,
  MicIcon,
  PlusIcon,
  ScreenShareIcon,
} from 'lucide-react';
import Image from 'next/image';
import { type FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

const messages: {
  from: 'user' | 'assistant';
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  tools?: {
    name: string;
    description: string;
    status: AIToolStatus;
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
  avatar: string;
  name: string;
}[] = [
  {
    from: 'user',
    versions: [
      {
        id: '1',
        content: 'Can you explain how to use React hooks effectively?',
      },
    ],
    avatar: 'https://github.com/haydenbleasel.png',
    name: 'Hayden Bleasel',
  },
  {
    from: 'assistant',
    sources: [
      {
        href: 'https://react.dev/reference/react',
        title: 'React Documentation',
      },
      {
        href: 'https://react.dev/reference/react-dom',
        title: 'React DOM Documentation',
      },
    ],
    tools: [
      {
        name: 'mcp',
        description: 'Searching React documentation',
        status: 'completed',
        parameters: {
          query: 'React hooks best practices',
          source: 'react.dev',
        },
        result: `{
  "query": "React hooks best practices",
  "results": [
    {
      "title": "Rules of Hooks",
      "url": "https://react.dev/warnings/invalid-hook-call-warning",
      "snippet": "Hooks must be called at the top level of your React function components or custom hooks. Don't call hooks inside loops, conditions, or nested functions."
    },
    {
      "title": "useState Hook",
      "url": "https://react.dev/reference/react/useState",
      "snippet": "useState is a React Hook that lets you add state to your function components. It returns an array with two values: the current state and a function to update it."
    },
    {
      "title": "useEffect Hook",
      "url": "https://react.dev/reference/react/useEffect",
      "snippet": "useEffect lets you synchronize a component with external systems. It runs after render and can be used to perform side effects like data fetching."
    }
  ]
}`,
        error: undefined,
      },
    ],
    versions: [
      {
        id: '1',
        content: `# React Hooks Best Practices

React hooks are a powerful feature that let you use state and other React features without writing classes. Here are some tips for using them effectively:

## Rules of Hooks

1. **Only call hooks at the top level** of your component or custom hooks
2. **Don't call hooks inside loops, conditions, or nested functions**

## Common Hooks

- **useState**: For local component state
- **useEffect**: For side effects like data fetching
- **useContext**: For consuming context
- **useReducer**: For complex state logic
- **useCallback**: For memoizing functions
- **useMemo**: For memoizing values

## Example of useState and useEffect

\`\`\`jsx
function ProfilePage({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // This runs after render and when userId changes
    fetchUser(userId).then(userData => {
      setUser(userData);
    });
  }, [userId]);
  
  return user ? <Profile user={user} /> : <Loading />;
}
\`\`\`

Would you like me to explain any specific hook in more detail?`,
      },
    ],
    avatar: 'https://github.com/openai.png',
    name: 'OpenAI',
  },
  {
    from: 'user',
    versions: [
      {
        id: '1',
        content:
          'Yes, could you explain useCallback and useMemo in more detail? When should I use one over the other?',
      },
      {
        id: '2',
        content:
          "I'm particularly interested in understanding the performance implications of useCallback and useMemo. Could you break down when each is most appropriate?",
      },
      {
        id: '3',
        content:
          'Thanks for the overview! Could you dive deeper into the specific use cases where useCallback and useMemo make the biggest difference in React applications?',
      },
    ],
    avatar: 'https://github.com/haydenbleasel.png',
    name: 'Hayden Bleasel',
  },
  {
    from: 'assistant',
    reasoning: {
      content: `The user is asking for a detailed explanation of useCallback and useMemo. I should provide a clear and concise explanation of each hook's purpose and how they differ.
      
The useCallback hook is used to memoize functions to prevent unnecessary re-renders of child components that receive functions as props.

The useMemo hook is used to memoize values to avoid expensive recalculations on every render.

Both hooks help with performance optimization, but they serve different purposes.`,
      duration: 10,
    },
    versions: [
      {
        id: '1',
        content: `## useCallback vs useMemo

Both hooks help with performance optimization, but they serve different purposes:

### useCallback

\`useCallback\` memoizes **functions** to prevent unnecessary re-renders of child components that receive functions as props.

\`\`\`jsx
// Without useCallback - a new function is created on every render
const handleClick = () => {
  console.log(count);
};

// With useCallback - the function is only recreated when dependencies change
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
\`\`\`

### useMemo

\`useMemo\` memoizes **values** to avoid expensive recalculations on every render.

\`\`\`jsx
// Without useMemo - expensive calculation runs on every render
const sortedList = expensiveSort(items);

// With useMemo - calculation only runs when items change
const sortedList = useMemo(() => expensiveSort(items), [items]);
\`\`\`

### When to use which?

- Use **useCallback** when:
  - Passing callbacks to optimized child components that rely on reference equality
  - Working with event handlers that you pass to child components

- Use **useMemo** when:
  - You have computationally expensive calculations
  - You want to avoid recreating objects that are used as dependencies for other hooks

### Performance Note

Don't overuse these hooks! They come with their own overhead. Only use them when you have identified a genuine performance issue.`,
      },
    ],
    avatar: 'https://github.com/openai.png',
    name: 'OpenAI',
  },
];

const models = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai.com' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai.com' },
  { id: 'claude-2', name: 'Claude 2', provider: 'anthropic.com' },
  { id: 'claude-instant', name: 'Claude Instant', provider: 'anthropic.com' },
  { id: 'palm-2', name: 'PaLM 2', provider: 'google.com' },
  { id: 'llama-2-70b', name: 'Llama 2 70B', provider: 'meta.com' },
  { id: 'llama-2-13b', name: 'Llama 2 13B', provider: 'meta.com' },
  { id: 'cohere-command', name: 'Command', provider: 'cohere.com' },
  { id: 'mistral-7b', name: 'Mistral 7B', provider: 'mistral.ai' },
];

const suggestions = [
  'What are the latest trends in AI?',
  'How does machine learning work?',
  'Explain quantum computing',
  'Best practices for React development',
  'Tell me about TypeScript benefits',
  'How to optimize database queries?',
  'What is the difference between SQL and NoSQL?',
  'Explain cloud computing basics',
];

const ChatTemplate = () => {
  const [model, setModel] = useState<string>(models[0].id);
  const [text, setText] = useState<string>('');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [status, setStatus] = useState<
    'submitted' | 'streaming' | 'ready' | 'error'
  >('ready');

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text) {
      return;
    }

    toast.success('Message submitted', {
      description: text,
    });
    setStatus('submitted');
    setTimeout(() => {
      setStatus('streaming');
    }, 200);
    setTimeout(() => {
      setStatus('ready');
    }, 2000);
  };

  const handleFileAction = (action: string) => {
    toast.success('File action', {
      description: action,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    toast.success('Suggestion clicked', {
      description: suggestion,
    });
    setStatus('submitted');
    setTimeout(() => {
      setStatus('streaming');
    }, 200);
    setTimeout(() => {
      setStatus('ready');
    }, 2000);
  };

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden">
      <AIConversation>
        <AIConversationContent>
          {messages.map(({ versions, ...message }, index) => (
            <AIBranch defaultBranch={0} key={index}>
              <AIBranchMessages>
                {versions.map((version) => (
                  <AIMessage from={message.from} key={version.id}>
                    <div>
                      {message.sources?.length && (
                        <AISources>
                          <AISourcesTrigger count={message.sources.length} />
                          <AISourcesContent>
                            {message.sources.map((source) => (
                              <AISource
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </AISourcesContent>
                        </AISources>
                      )}
                      {message.tools?.map((toolCall) => (
                        <AITool key={toolCall.name}>
                          <AIToolHeader
                            description={toolCall.description}
                            name={`Called MCP tool: ${toolCall.name}`}
                            status={toolCall.status}
                          />
                          <AIToolContent>
                            <AIToolParameters
                              parameters={toolCall.parameters}
                            />
                            {(toolCall.result || toolCall.error) && (
                              <AIToolResult
                                error={toolCall.error}
                                result={toolCall.result}
                              />
                            )}
                          </AIToolContent>
                        </AITool>
                      ))}
                      {message.reasoning && (
                        <AIReasoning duration={message.reasoning.duration}>
                          <AIReasoningTrigger />
                          <AIReasoningContent>
                            {message.reasoning.content}
                          </AIReasoningContent>
                        </AIReasoning>
                      )}
                      <AIMessageContent>
                        <AIResponse>{version.content}</AIResponse>
                      </AIMessageContent>
                    </div>
                    <AIMessageAvatar name={message.name} src={message.avatar} />
                  </AIMessage>
                ))}
              </AIBranchMessages>
              {versions.length > 1 && (
                <AIBranchSelector from={message.from}>
                  <AIBranchPrevious />
                  <AIBranchPage />
                  <AIBranchNext />
                </AIBranchSelector>
              )}
            </AIBranch>
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <div className="grid shrink-0 gap-4 pt-4">
        <AISuggestions className="px-4">
          {suggestions.map((suggestion) => (
            <AISuggestion
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              suggestion={suggestion}
            />
          ))}
        </AISuggestions>
        <div className="w-full px-4 pb-4">
          <AIInput onSubmit={handleSubmit}>
            <AIInputTextarea
              onChange={(event) => setText(event.target.value)}
              value={text}
            />
            <AIInputToolbar>
              <AIInputTools>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <AIInputButton>
                      <PlusIcon size={16} />
                      <span className="sr-only">Add attachment</span>
                    </AIInputButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => handleFileAction('upload-file')}
                    >
                      <FileIcon className="mr-2" size={16} />
                      Upload file
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFileAction('upload-photo')}
                    >
                      <ImageIcon className="mr-2" size={16} />
                      Upload photo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFileAction('take-screenshot')}
                    >
                      <ScreenShareIcon className="mr-2" size={16} />
                      Take screenshot
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFileAction('take-photo')}
                    >
                      <CameraIcon className="mr-2" size={16} />
                      Take photo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AIInputButton
                  onClick={() => setUseMicrophone(!useMicrophone)}
                  variant={useMicrophone ? 'default' : 'ghost'}
                >
                  <MicIcon size={16} />
                  <span className="sr-only">Microphone</span>
                </AIInputButton>
                <AIInputButton
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  variant={useWebSearch ? 'default' : 'ghost'}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </AIInputButton>
                <AIInputModelSelect onValueChange={setModel} value={model}>
                  <AIInputModelSelectTrigger>
                    <AIInputModelSelectValue />
                  </AIInputModelSelectTrigger>
                  <AIInputModelSelectContent>
                    {models.map((model) => (
                      <AIInputModelSelectItem key={model.id} value={model.id}>
                        <Image
                          alt={model.provider}
                          className="inline-flex size-4"
                          height={16}
                          src={`https://www.google.com/s2/favicons?domain=${model.provider}`}
                          unoptimized
                          width={16}
                        />
                        {model.name}
                      </AIInputModelSelectItem>
                    ))}
                  </AIInputModelSelectContent>
                </AIInputModelSelect>
              </AIInputTools>
              <AIInputSubmit disabled={!text} status={status} />
            </AIInputToolbar>
          </AIInput>
        </div>
      </div>
    </div>
  );
};

export default ChatTemplate;