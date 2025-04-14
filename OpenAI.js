import OpenAI from "https://cdn.skypack.dev/openai";
import { GITHUB_TOKEN } from './variables.js';


const token = GITHUB_TOKEN;


export async function main(userCommand) { // // main function to process user command
 // userCommand is the command spoken by the user
 const client = new OpenAI({
   baseURL: "https://models.inference.ai.azure.com",
   apiKey: token,
   dangerouslyAllowBrowser: true
 });


 const response = await client.chat.completions.create({ // // create a chat completion
   // // using OpenAI API
   messages: [
     {
       role: "system",
       content: `You are a task analyzer. Extract the following details from the user's input:
       1. Operation (Add/Delete/Update)
       2. Task description
       3. Urgency (High/Medium/Low)
       4. Date and Time (if mentioned in dd/mm/yyyy format)


       Respond in JSON format like:
       {
         "operation": "...",
         "task": "...",
         "urgency": "...",
         "datetime": "..."
       }
      
       Keep the task field case-insensitive for comparison purposes.`
     },
     {
       role: "user",
       content: userCommand
     }
   ],
   model: "gpt-4o",
   temperature: 0.7,
   max_tokens: 4096,
   top_p: 1
 });

 return response;
}
