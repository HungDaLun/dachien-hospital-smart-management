
import { METADATA_ANALYSIS_PROMPT } from '../lib/knowledge/prompts';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') });

async function testDIKWPrompt() {
    console.log('🧪 Testing DIKW Classification Prompt...');

    const testCases = [
        {
            name: 'Raw Data (Meeting Log)',
            content: `
            Meeting Date: 2026-01-14
            Attendees: John, Jane, Bob
            
            Agenda:
            1. Review weekly numbers
            2. Discuss coffee machine
            
            Notes:
            - Weekly numbers are up by 5%
            - Coffee machine is broken again
            - Bob will call the repair guy
            `
        },
        {
            name: 'Information (Weekly Report)',
            content: `
            # Weekly Sales Report - Week 2
            
            ## Summary
            Sales increased by 5% compared to last week. Top performing region was North America.
            
            ## Details
            - NA: $50,000 (+10%)
            - EU: $30,000 (-2%)
            - APAC: $20,000 (+5%)
            `
        },
        {
            name: 'Knowledge (Persona Analysis)',
            content: `
            # Persona: The Tech-Savvy Millennial
            
            ## Demographics
            - Age: 25-34
            - Location: Urban areas
            - Income: $50k+
            
            ## Psychographics
            - Values convenience and speed
            - Early adopter of technology
            - Prefers digital channels for support
            
            ## Implications
            We should focus our marketing on Instagram and TikTok. Support should be chat-first.
            `
        },
        {
            name: 'Wisdom (SOP / Policy)',
            content: `
            # Remote Work Policy (SOP-HR-001)
            
            ## Purpose
            To define the guidelines for remote work.
            
            ## Principles
            1. Trust is the foundation.
            2. Output > Input.
            
            ## Procedure
            1. Employees must notify manager by 9 AM.
            2. Core hours are 10 AM - 3 PM.
            3. Use Slack for daily standup.
            
            ## Best Practices
            - Ensure a quiet workspace.
            - Take regular breaks.
            `
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n\n📝 Analyzing: ${testCase.name}`);
        console.log('-----------------------------------');
        try {
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

            const fullPrompt = `${METADATA_ANALYSIS_PROMPT}\n\n**Document Content:**\n${testCase.content}`;

            const result = await model.generateContent(fullPrompt);
            const response = result.response;
            const text = response.text();

            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || [null, text];
            const jsonString = jsonMatch[1] || text;

            let data: any = {};
            try {
                data = JSON.parse(jsonString);
            } catch (e) {
                console.log('Raw output:', text);
            }

            console.log(`🎯 Predicted Level: \x1b[36m${data.dikw_level}\x1b[0m`);
            console.log(`Confidence: ${data.governance?.confidence}`);
            console.log(`Summary: ${data.summary}`);

        } catch (error) {
            console.error(`❌ Error testing ${testCase.name}:`, error);
        }
    }
}

testDIKWPrompt();
