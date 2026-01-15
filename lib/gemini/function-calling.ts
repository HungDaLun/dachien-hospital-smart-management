import { GoogleGenerativeAI } from '@google/generative-ai';
import { executeTool } from '@/lib/tools/executor';
import { getToolDeclarations } from '@/lib/tools/registry';
import { ToolContext } from '@/lib/tools/types';

/**
 * Creates a chat stream with Gemini that supports Function Calling.
 * Handles the recursive loop of Model -> Tool Call -> Execute -> Model Response.
 */
export async function chatWithTools(
    apiKey: string,
    modelVersion: string,
    systemPrompt: string,
    userMessage: string,
    enabledTools: string[],
    context: ToolContext,
    history: Array<{ role: string; content: string }> = []
): Promise<ReadableStream<Uint8Array>> {

    const genAI = new GoogleGenerativeAI(apiKey);

    // 1. Load Tool Definitions (FunctionDeclarations)
    const { functionDeclarations } = await getToolDeclarations(enabledTools);

    // 2. Initialize Model with Tools
    const model = genAI.getGenerativeModel({
        model: modelVersion || 'gemini-3-flash-preview', // Default to a known model if version not provided
        systemInstruction: systemPrompt,
        tools: functionDeclarations.length > 0 ? [{
            functionDeclarations: functionDeclarations
        }] : undefined,
    });

    // 3. Start Chat Session
    const chat = model.startChat({
        history: history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        })),
    });

    // 4. Send Message and Handle Tool Loop
    // We use a ReadableStream to stream the response back to the client
    return new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            try {
                console.log('[GeminiToolChat] Sending message to model:', userMessage);

                // Initial request
                let result = await chat.sendMessage(userMessage);
                let response = await result.response;

                // Loop while there are function calls
                // The SDK might handle automatic function calling if configured, but often we need manual control for streaming + custom execution
                // We will manually check for functionCalls

                let functionCalls = response.functionCalls();
                let depth = 0;
                const MAX_DEPTH = 5; // Prevent infinite loops

                while (functionCalls && functionCalls.length > 0 && depth < MAX_DEPTH) {
                    depth++;
                    console.log(`[GeminiToolChat] Call depth ${depth}, detected ${functionCalls.length} calls`);

                    // Process all function calls in parallel or sequence
                    // Gemini usually returns one or more calls in a single turn

                    const functionResponses = [];

                    for (const call of functionCalls) {
                        const toolName = call.name;
                        const toolArgs = call.args;

                        // Notify client that a tool is being called (optional, for UI feedback)
                        controller.enqueue(encoder.encode(
                            `data: ${JSON.stringify({ type: 'tool_call', tool: toolName, params: toolArgs })}\n\n`
                        ));

                        console.log(`[GeminiToolChat] Executing tool: ${toolName}`);

                        // Execute the tool
                        const toolResult = await executeTool(toolName, toolArgs as any, context);

                        // Notify client of the result (optional)
                        controller.enqueue(encoder.encode(
                            `data: ${JSON.stringify({ type: 'tool_result', tool: toolName, result: toolResult })}\n\n`
                        ));

                        // Prepare response for the model
                        functionResponses.push({
                            functionResponse: {
                                name: toolName,
                                response: {
                                    content: toolResult
                                } // Gemini expects this structure
                            }
                        });
                    }

                    // Send function execution results back to the model
                    console.log('[GeminiToolChat] Sending tool outputs back to model');
                    result = await chat.sendMessage(functionResponses);
                    response = await result.response;

                    // Check if the model wants to call more tools
                    functionCalls = response.functionCalls();
                }

                // Final text response
                const text = response.text();
                if (text) {
                    controller.enqueue(encoder.encode(
                        `data: ${JSON.stringify({ type: 'text', content: text })}\n\n`
                    ));
                }

                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();

            } catch (error: any) {
                console.error('[GeminiToolChat] Error:', error);
                controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`
                ));
                controller.close();
            }
        }
    });
}
