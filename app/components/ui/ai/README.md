# AI Components

A comprehensive collection of AI chat components built with React and shadcn/ui.

## Components

### Core Components

#### `AIMessage`
Individual message component with support for user/assistant roles, avatars, timestamps, and actions (copy, thumbs up/down).

```tsx
import { AIMessage } from "@/app/components/ui/ai";

<AIMessage
  role="assistant"
  content="Hello! How can I help you today?"
  timestamp={new Date()}
  onCopy={() => console.log("Copied")}
  onThumbsUp={() => console.log("Thumbs up")}
  onThumbsDown={() => console.log("Thumbs down")}
/>
```

#### `AIInput`
Enhanced input component with auto-resize textarea, submit button, voice input, and file attachment support.

```tsx
import { AIInput } from "@/app/components/ui/ai";

<AIInput
  value={input}
  onChange={setInput}
  onSubmit={handleSubmit}
  placeholder="Type your message..."
  loading={isLoading}
  onStop={handleStop}
  onAttach={handleAttachment}
  onVoiceInput={handleVoice}
  maxLength={4000}
/>
```

#### `AIConversation`
Conversation container with auto-scroll and scroll-to-bottom functionality.

```tsx
import { AIConversation, AIConversationContent } from "@/app/components/ui/ai";

<AIConversation autoScroll showScrollButton>
  <AIConversationContent>
    {messages.map(message => (
      <AIMessage key={message.id} {...message} />
    ))}
  </AIConversationContent>
</AIConversation>
```

### Enhancement Components

#### `AISuggestions`
Pre-written prompt suggestions that users can click to start conversations.

```tsx
import { AISuggestions, AISuggestionCard } from "@/app/components/ui/ai";

<AISuggestions
  title="Try asking:"
  suggestions={[
    "Help me with tax planning",
    "Explain expense categories",
    "Generate financial report"
  ]}
  onSuggestionClick={handleSuggestion}
/>
```

#### `AITypingIndicator`
Animated typing indicator for when AI is generating responses.

```tsx
import { AITypingIndicator } from "@/app/components/ui/ai";

<AITypingIndicator 
  text="AI is thinking..." 
  size="md" 
  showAvatar 
/>
```

#### `AIMarkdown`
Markdown renderer with syntax highlighting and copy functionality.

```tsx
import { AIMarkdown } from "@/app/components/ui/ai";

<AIMarkdown
  content="## Code Example\n```typescript\nconst hello = 'world';\n```"
  showCopyButton
/>
```

#### `AISources`
Display source links and references with metadata.

```tsx
import { AISources } from "@/app/components/ui/ai";

<AISources
  title="Sources"
  sources={[
    {
      id: "1",
      title: "Tax Guidelines 2024",
      url: "https://example.com/tax",
      description: "Official tax documentation",
      type: "web"
    }
  ]}
  maxSources={3}
/>
```

#### `AIReasoning`
Collapsible reasoning steps showing AI's thought process.

```tsx
import { AIReasoning } from "@/app/components/ui/ai";

<AIReasoning
  title="How I solved this"
  steps={[
    {
      id: "1",
      title: "Analysis",
      content: "First, I analyzed the financial data...",
      type: "thinking"
    },
    {
      id: "2",
      title: "Calculation",
      content: "Then I calculated the tax implications...",
      type: "analysis"
    }
  ]}
  defaultOpen={false}
/>
```

### Complete Chat Component

#### `AIChat`
All-in-one chat component that combines all the above components.

```tsx
import { AIChat } from "@/app/components/ui/ai";

<AIChat
  messages={messages}
  input={input}
  onInputChange={setInput}
  onSendMessage={handleSend}
  isLoading={isLoading}
  suggestions={[
    "Help with accounting",
    "Tax questions",
    "Financial planning"
  ]}
  showSources
  showReasoning
  showCopyButtons
  showFeedback
  onMessageCopy={handleCopy}
  onMessageFeedback={handleFeedback}
/>
```

## Usage Examples

### Basic Chat Implementation

```tsx
import { useState } from "react";
import { AIChat, type Message } from "@/app/components/ui/ai";

export function MyAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Send to AI API and get response
    const response = await sendToAI(message);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      sources: response.sources,
      reasoning: response.reasoning
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <AIChat
      messages={messages}
      input={input}
      onInputChange={setInput}
      onSendMessage={handleSend}
      isLoading={isLoading}
    />
  );
}
```

### Accounting-Specific Suggestions

```tsx
const accountingSuggestions = [
  "Help me categorize business expenses",
  "Explain tax deductions for my company",
  "Generate a profit and loss statement",
  "What are the VAT requirements?",
  "Help with invoice management",
  "Explain depreciation methods"
];

<AIChat
  // ... other props
  suggestions={accountingSuggestions}
  showSuggestions
/>
```

## Styling

All components use Tailwind CSS classes and respect your theme configuration. They're built on top of shadcn/ui components for consistency.

## Dependencies

- React
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- clsx & tailwind-merge (for className utilities)

## Browser Support

- Modern browsers with ES2020+ support
- Clipboard API for copy functionality
- Resize Observer for auto-resize textarea