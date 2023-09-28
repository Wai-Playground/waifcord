Testing different forms of function calling. Trying to get the best ratio of function schema adherence, token saving and efficiency.

🧪 Test.ts (Optimization Test)

> Passes only one function with multiple function names in its params.
Expectations: Since we are only passing one function per message to the AI, it should stack up the more we talk to it.

| AI: "I want this function: getUser" (1)
| Function: "Okay, here is the getUser function's params"
| AI: "Okay, I am calling the getUser function using the given params" (2)

> Some trickery with removing the function_call message.

Result: Not much difference to TestTwo, lower adherence using gpt-3.
Probably because of the double calling, it didn't matter with the optimizations.


#########################################

🧪 TestTwo.ts (No Optimization)

> Passes all functions at once to completion api.
Expectation: Better adherence, but more tokens since we are passing in a lot of functions every call.

| AI: "Calling getUser function using the given params" (1)
| Function: "Done, here is the result"

Result: Lower token usage, for some reason. But better adherence.

Conclusion: Probably need to go back to the drawing board.

Idea: Remove function calls after they are done, replacing them with just the result?