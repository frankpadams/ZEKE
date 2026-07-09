# Manual AI Packet Workflow

Project Zeke supports a platform-agnostic AI path that does not require an API connection.

## Purpose

Zeke can create a focused packet for a specific task. The user can upload that packet to any capable AI service, then upload the structured response back into Zeke.

## Workflow

1. Open Settings → AI Connection.
2. Choose **Use any AI manually**.
3. Select the analysis task and time window.
4. Optionally enter a question or focus.
5. Click **Create & download AI packet**.
6. Upload the JSON packet to the AI service of choice.
7. Instruct the AI to follow the `response_instruction` and `response_schema` in the packet.
8. Save the AI's JSON response as a `.json` file.
9. Return to Zeke and click **Upload AI response**.
10. Review:
    - findings;
    - proposed discoveries;
    - recommended investigation questions;
    - proposed actions.
11. Proposed actions are not selected by default.
12. Click **Apply selected items** only after review.

## Data minimization

Packets are task-specific. For example, an exercise-progression packet includes workouts and relevant recovery/injury context, but does not automatically include every unrelated lab record.

## Trust boundary

AI responses are advisory. They do not overwrite raw observations or imported history. Imported AI findings are labeled with their source packet and remain distinct from user-confirmed facts and raw evidence.
