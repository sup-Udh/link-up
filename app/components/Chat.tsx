"use client"

import { useEffect, useState } from "react";
import { getWsUrl, useRoom } from "@/app/lib/RoomContext"
import { useParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { clearInterval } from "timers";

type BroadcastMessage = {
    type: string;
    message: string;
};



export default function Chat({ senderId }: { senderId: string}){
    const { messages, addMessage, currentUser } = useRoom();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const param = useParams();
    
    useEffect(() => {
        const ws = new WebSocket("ws://localhost/socket");
        setSocket(ws);

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "NEW_MESSAGE") {
                    addMessage(data.message);
                }
            } catch (err) {
                console.error("Failed to parse chat websocket message:", err);
            }
        };
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
            console.log("🚀 Client sending keep-alive ping packet...");
            ws.send(JSON.stringify({ type: "ping" })); 
            }
        }, 10000);

        const handleInput = (event: globalThis.KeyboardEvent): void => {
            if (event.key !== "Enter") return;
            
            const inputEl = document.getElementById("chatbox") as HTMLInputElement | null;
            if (!inputEl) return;

            const val = inputEl.value.trim();
            if (!val) return;

            inputEl.value = "";
            ws.send(JSON.stringify({ roomId: param.roomId, type: "broadcastMessage", text: val, senderId:currentUser?.name }));
        };

        const inputEl = document.getElementById('chatbox') as HTMLInputElement | null;
        inputEl?.addEventListener('keydown', handleInput as EventListener);

        return () => {
            inputEl?.removeEventListener('keydown', handleInput as EventListener);
            clearInterval(pingInterval);
            ws.close();
        };
    }, [param.roomId]);

    
    return(
        <div>
            <input
            id = "chatbox"
            type="text"
            placeholder="Chat with the room"
            />
            <div style={{ border: '1px solid #ccc', height: '200px', overflowY: 'scroll', marginBottom: '10px' }}>
            {
            messages.toReversed().map((msg, index) => (
            <p key={index} style={{ padding: '5px 10px', margin: 0 }}>
                📢 {msg}
                </p>
                ))}
            </div>

        </div>
        
    )
}