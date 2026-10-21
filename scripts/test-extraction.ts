import "dotenv/config";
import { extractContext } from "../src/lib/llm";

const testNotes = [
  // 1. Standard dev work
  "Working on the onboarding flow. Got the email verification working, but the OTP is timing out. Next step is to check the Redis cache.",
  
  // 2. CI/Debugging
  "Debugging the CI pipeline. The build keeps failing on the linting step. Tried running lint locally and it passes. Blocked by the cache issue in GitHub Actions.",
  
  // 3. Non-dev work (Should be rejected by your API, but we want to see what the LLM does)
  "Need to create the Q3 revenue report. Pulled the data from Salesforce, now need to format it in Excel.",
  
  // 4. Memory Leak
  "Investigating a memory leak in the Node.js backend. Heap snapshots show a lot of unclosed database connections. Next step is to add connection pooling.",
  
  // 5. Security Audit
  "Security audit today. Found an XSS vulnerability in the comments section. Sanitized the input and deployed a hotfix. Sarah needs to verify the patch.",
  
  // 6. "No Blockers" edge case
  "Refactoring the user settings page to use React Server Components. No blockers, just tedious work. Next, I need to migrate the password reset form.",
  
  // 7. Mobile Crash
  "App crashing on Android 14 when uploading images over 5MB. Tried clearing the cache, didn't help. Next step is to check the memory limit in the manifest.",
  
  // 8. DB Migration
  "Writing the Prisma migration to add the 'tags' column to the ContextCard table. Tested it locally, works fine. Next step is to run it on the staging database.",
  
  // 9. Very short note (Edge case)
  "Fixing the login bug.",
  
  // 10. Non-work note (Groceries - Edge case)
  "I need to buy groceries and call my mom."
];

async function run() {
  for (let i = 0; i < testNotes.length; i++) {
    console.log(`\n--- Note ${i + 1} ---`);
    console.log(`Raw: ${testNotes[i]}`);
    try {
      const result = await extractContext(testNotes[i]);
      console.log("Extracted:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Failed:", error);
    }
  }
}

run();