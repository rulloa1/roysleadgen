
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Lead } from '../types';

interface LiveCallOverlayProps {
  lead: Lead;
  onClose: () => void;
}

// Audio Utils as per documentation
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveCallOverlay: React.FC<LiveCallOverlayProps> = ({ lead, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'calling' | 'connected' | 'ended'>('connecting');
  const [transcription, setTranscription] = useState<{ role: 'user' | 'agent', text: string }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const currentOutputTranscriptionRef = useRef<string>('');
  const currentInputTranscriptionRef = useRef<string>('');

  useEffect(() => {
    const startCall = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setStatus('calling');
              // Setup microphone stream
              const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
              const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmBlob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current!.destination);
              
              // Initial greeting from AI
              setTimeout(() => {
                setStatus('connected');
              }, 2000);
            },
            onmessage: async (message: any) => {
              // Handle Transcription
              if (message.serverContent?.outputTranscription) {
                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
              } else if (message.serverContent?.inputTranscription) {
                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
              }

              if (message.serverContent?.turnComplete) {
                const userText = currentInputTranscriptionRef.current;
                const agentText = currentOutputTranscriptionRef.current;
                
                setTranscription(prev => [
                  ...(userText ? [{ role: 'user' as const, text: userText }] : []),
                  ...(agentText ? [{ role: 'agent' as const, text: agentText }] : [])
                ].slice(-10));
                
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
              }

              // Handle Audio Output
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && outputAudioContextRef.current) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  outputAudioContextRef.current,
                  24000,
                  1,
                );
                const sourceNode = outputAudioContextRef.current.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(outputAudioContextRef.current.destination);
                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(sourceNode);
                sourceNode.onended = () => sourcesRef.current.delete(sourceNode);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onerror: (e) => console.error("Call error:", e),
            onclose: () => setStatus('ended'),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
            },
            systemInstruction: `You are an AI Outbound Agent calling ${lead.name} on behalf of Roy's Company. 
            Your goal is to pitch an AI voice agent service. Be friendly, professional, and try to handle objections. 
            Start by introducing yourself: "Hi ${lead.name}, this is Roy's AI assistant calling..."`
          },
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Failed to start call:", err);
      }
    };

    startCall();

    return () => {
      sessionRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  }, [lead.id]);

  const handleHangUp = () => {
    sessionRef.current?.close();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Visualizer Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center h-full pt-20 pb-12 px-6">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 relative">
             {status === 'connected' && <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-50"></div>}
             <span className="text-4xl font-bold">{lead.name[0]}</span>
          </div>
          <h2 className="text-3xl font-black mb-2">{lead.name}</h2>
          <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">
            {status === 'connecting' ? 'Initiating Outbound Stream...' : 
             status === 'calling' ? 'Ringing...' : 
             status === 'connected' ? 'Live AI Conversation' : 'Call Ended'}
          </p>
        </div>

        {/* Live Transcript */}
        <div className="flex-1 w-full bg-white/5 rounded-3xl border border-white/10 p-6 overflow-y-auto mb-8 space-y-4 no-scrollbar">
          {transcription.length === 0 ? (
             <div className="h-full flex items-center justify-center text-slate-500 italic text-sm text-center px-10">
               Conversation transcript will appear here in real-time...
             </div>
          ) : (
            transcription.map((t, i) => (
              <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${t.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none'}`}>
                  {t.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>

          <button 
            onClick={handleHangUp}
            className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl shadow-red-900/40 hover:bg-red-700 hover:scale-110 transition-all active:scale-95"
          >
            <svg className="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>

          <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12 7-12 6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveCallOverlay;
