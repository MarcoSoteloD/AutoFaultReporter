# **App Name**: AutoFault Reporter

## Core Features:

- Owner Info Input: Capture owner's name, phone number, and license plate via input fields.
- Fault Description with AI Assist: Input field for a detailed description of the vehicle fault, pre-populated using generative AI suggestions, leveraging knowledge of common issues. An LLM tool uses data related to vehicle makes, models, and typical failure modes when considering suggestions.
- GPS Location Capture: Use device GPS to automatically save the current location.
- Photo Capture/Upload: Enable the technician to take photos of the vehicle and damaged parts directly within the app or upload them from the device's gallery.
- Signature Capture: Implement signature capture using a canvas widget for both the vehicle owner and the technician.
- Report Submission: Simulate the upload of images and signatures (converted to Base64 strings) along with the report data to a mock REST API endpoint upon submission.

## Style Guidelines:

- Primary color: Deep blue (#1E3A8A), reflecting trust and reliability.
- Background color: Light gray (#F0F3F5), providing a neutral backdrop.
- Accent color: Vivid orange (#EA580C) to highlight important actions and calls to action.
- Use a clear, sans-serif font for all text, ensuring readability on various screen sizes.
- Employ a consistent set of line icons for navigation and common actions, enhancing usability.
- Design a responsive layout that adapts seamlessly to different screen sizes and orientations, ensuring a consistent user experience.
- Incorporate subtle animations and transitions to provide feedback and enhance the overall user experience, without being distracting.