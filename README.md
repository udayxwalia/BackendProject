# BackendProject

## Tech Stack
Node.js
Express
Render (Deployment)

## Base URL
https://your-render-url.onrender.com

## Endpoints

### POST /bfhl

**Description:**
Processes one of the following inputs:

* fibonacci — returns Fibonacci series
* prime — returns only prime numbers
* lcm — returns LCM of numbers
* hcf — returns HCF (GCD)
* AI — returns single-word AI answer

**Example Request:**
```json
POST /bfhl
{
  "prime": [2,4,7,9,11]
}
```

### GET /health

**Description:**
Returns API health status.

## Run Locally
```bash
npm install
node index.js
```

## Environment Variables
```
GEMINI_API_KEY=your_api_key_here
```

## Deployment
This API is deployed as a Render Web Service.
