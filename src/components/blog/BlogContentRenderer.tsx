import React from "react";

interface BlogContentRendererProps {
    content: any[];
}

/**
 * Parses and renders mixed content within a paragraph:
 * - ##text## → bold text (only if on same line, ends before line break)
 * - ```code``` → code block
 * - Regular text → normal paragraph text
 */
export const parseMixedContent = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    
    // First, handle code blocks (```)
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let match;
    let lastIndex = 0;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
            const beforeText = text.substring(lastIndex, match.index);
            parts.push(...parseBoldText(beforeText));
        }
        
        // Add code block
        const code = match[1].trim();
        parts.push(
            <pre
                key={`code-${match.index}`}
                className="bg-surface border border-border rounded-lg p-4 overflow-x-auto my-4 block w-full"
            >
                <code className="text-sm text-muted-foreground font-mono whitespace-pre">
                    {code}
                </code>
            </pre>
        );
        
        lastIndex = codeBlockRegex.lastIndex;
    }
    
    // Add remaining text after last code block
    if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        parts.push(...parseBoldText(remainingText));
    }
    
    // If no code blocks found, just parse bold text
    if (parts.length === 0) {
        return parseBoldText(text);
    }
    
    return parts;
};

/**
 * Parses bold text using ##text## syntax (only works on same line, ends before line break)
 */
const parseBoldText = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, lineIndex) => {
        if (lineIndex > 0) {
            parts.push(<br key={`br-${lineIndex}`} />);
        }
        
        // Process bold text on this line: ##text##
        const boldRegex = /##([^#\n]+?)##/g;
        let match;
        let lastIndex = 0;
        const lineParts: React.ReactNode[] = [];
        
        while ((match = boldRegex.exec(line)) !== null) {
            // Add text before bold
            if (match.index > lastIndex) {
                lineParts.push(line.substring(lastIndex, match.index));
            }
            
            // Add bold text
            lineParts.push(
                <strong key={`bold-${lineIndex}-${match.index}`} className="font-semibold text-foreground">
                    {match[1]}
                </strong>
            );
            
            lastIndex = boldRegex.lastIndex;
        }
        
        // Add remaining text after last bold
        if (lastIndex < line.length) {
            lineParts.push(line.substring(lastIndex));
        }
        
        // If no bold found on this line, add the whole line
        if (lineParts.length === 0) {
            lineParts.push(line);
        }
        
        parts.push(...lineParts);
    });
    
    return parts;
};

/**
 * Renders article content blocks:
 * - "## " → h2 (when block starts with "## ")
 * - ``` → code block (when block starts with ```)
 * - otherwise → paragraph with mixed content support (##text## for bold, ```code``` for code)
 * Note: Skips the first block (index 0) as it's already shown as the excerpt
 */
const BlogContentRenderer = ({ content }: BlogContentRendererProps) => {
    // Skip the first block (index 0) since it's shown as excerpt
    const contentToRender = (content || []).length > 1 ? content.slice(1) : [];

    // If no content to render, return null
    if (contentToRender.length === 0) {
        return null;
    }

    return (
        <article className="prose prose-invert max-w-none">
            {contentToRender.map((blockRaw, index) => {
                // Adjust index to match original array for key stability
                const originalIndex = index + 1;
                
                const block = typeof blockRaw === 'object' && blockRaw !== null && 'content' in blockRaw 
                    ? blockRaw.content 
                    : blockRaw;
                    
                if (typeof block !== 'string') {
                    return null;
                }

                // Handle markdown-style headers (## )
                if (block.startsWith("## ")) {
                    return (
                        <h2
                            key={originalIndex}
                            className="font-heading text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4"
                        >
                            {block.replace("## ", "")}
                        </h2>
                    );
                }

                // Handle code blocks (```)
                if (block.startsWith("```")) {
                    const code = block
                        .replace(/```\w*\n?/, "")
                        .replace(/```$/, "")
                        .trim();
                    return (
                        <pre
                            key={originalIndex}
                            className="bg-surface border border-border rounded-lg p-4 overflow-x-auto my-6"
                        >
                            <code className="text-sm text-muted-foreground font-mono">
                                {code}
                            </code>
                        </pre>
                    );
                }

                // Default: render as paragraph with mixed content support
                return (
                    <div key={originalIndex} className="text-muted-foreground leading-relaxed mb-4">
                        {parseMixedContent(block)}
                    </div>
                );
            })}
        </article>
    );
};

export default BlogContentRenderer;

