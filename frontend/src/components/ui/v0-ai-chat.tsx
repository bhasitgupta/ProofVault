"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

export function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

export function ActionButton({ icon, label, onClick }: ActionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF6EF] hover:bg-white rounded-full border border-[#D8CFBC] text-[#565449] hover:text-[#11120D] text-xs font-medium transition-all shadow-xs shrink-0 cursor-pointer"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

export function VercelV0Chat({
    onSend,
    placeholder = "Ask Judicial AI a question...",
    disabled = false,
}: {
    onSend?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 56,
        maxHeight: 180,
    });

    const handleSend = () => {
        if (!value.trim() || disabled) return;
        if (onSend) onSend(value.trim());
        setValue("");
        adjustHeight(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full">
            <div className="relative bg-white rounded-2xl border border-[#D8CFBC] shadow-sm focus-within:border-[#11120D] transition-colors">
                <div className="overflow-y-auto">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                            "w-full px-4 pt-3.5 pb-2",
                            "resize-none",
                            "bg-transparent",
                            "border-none",
                            "text-stone-900 text-sm",
                            "focus:outline-none",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-stone-400 placeholder:text-sm",
                            "min-h-[56px]"
                        )}
                        style={{
                            overflow: "hidden",
                        }}
                    />
                </div>

                <div className="flex items-center justify-between p-2.5 border-t border-[#F2ECE0]">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-stone-400 px-2 py-0.5 rounded bg-stone-50 border border-stone-200 hidden sm:inline">
                            BSA §63 Verified
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!value.trim() || disabled}
                            className={cn(
                                "p-2 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-40",
                                value.trim()
                                    ? "bg-[#11120D] text-[#FFFBF4] hover:bg-[#1e1f18] shadow-xs"
                                    : "bg-stone-100 text-stone-400 border border-stone-200"
                            )}
                            title="Send Query"
                        >
                            <ArrowUpIcon className="w-4 h-4" />
                            <span className="sr-only">Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VercelV0Chat;
