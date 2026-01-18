import logging
import os
import aiohttp
import json
from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import openai, silero

load_dotenv(dotenv_path=".env.local")

logger = logging.getLogger("voice-assistant")

class SuperAssistantLLM(llm.LLM):
    def __init__(self):
        super().__init__()

    async def chat(
        self,
        history: llm.ChatContext,
        fnc_ctx: llm.FunctionContext | None = None,
        temperature: float | None = None,
        n: int | None = None,
        parallel_tool_calls: bool | None = None,
    ) -> "llm.LLMStream":
        # Get the last user message
        user_msg = history.messages[-1].content
        if isinstance(user_msg, list):
            user_msg = " ".join([c for c in user_msg if isinstance(c, str)])
        
        logger.info(f"Forwarding to Super Assistant: {user_msg}")

        # Call Next.js API
        async with aiohttp.ClientSession() as session:
            # Get base URL from environment
            base_url = os.getenv("NEXT_PUBLIC_APP_URL", "https://nexus-ai.zeabur.app")
            async with session.post(
                f"{base_url}/api/super-assistant/chat",
                json={"text": user_msg, "sessionId": "voice-dev"},
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    response_text = data.get("text", "抱歉，我沒有聽到回應。")
                else:
                    response_text = f"系統連線錯誤: {resp.status}"

        # Create a stream to return the text
        return llm.LLMStream.from_text(response_text)

def prewarm(proc: JobContext):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()
    
    # Use our custom LLM that talks to Next.js
    custom_llm = SuperAssistantLLM()

    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=openai.STT(),
        llm=custom_llm, 
        tts=openai.TTS(),
    )

    agent.start(ctx.room, participant)

    await agent.say("超級管家已連線。您可以直接用說話的方式與我互動。", allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )
