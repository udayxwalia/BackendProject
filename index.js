require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = "uday0990.be23@chitkara.edu.in";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json());
app.use(cors());

// POST /bfhl
app.post('/bfhl', async (req, res) => {
    try {
        const bodyKeys = Object.keys(req.body);

        // Validation: More than one key or zero keys
        if (bodyKeys.length !== 1) {
            return res.status(400).json({
                is_success: false,
                official_email: OFFICIAL_EMAIL,
                error: "Request must contain exactly one key"
            });
        }

        const key = bodyKeys[0];
        const value = req.body[key];

        // Process based on key
        let result = null;

        switch (key) {
            case 'fibonacci':
                if (!Number.isInteger(value)) {
                    return res.status(422).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Value for 'fibonacci' must be an integer"
                    });
                }
                if (value < 0) {
                    return res.status(400).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Fibonacci count cannot be negative"
                    });
                }
                result = generateFibonacci(value);
                break;

            case 'prime':
                if (!Array.isArray(value) || !value.every(Number.isInteger)) {
                    return res.status(422).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Value for 'prime' must be an integer array"
                    });
                }
                if (value.length === 0) {
                    return res.status(400).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Array cannot be empty"
                    });
                }
                result = value.filter(isPrime);
                break;

            case 'lcm':
                if (!Array.isArray(value) || !value.every(Number.isInteger)) {
                    return res.status(422).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Value for 'lcm' must be an integer array"
                    });
                }
                if (value.length === 0) {
                    return res.status(400).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Array cannot be empty"
                    });
                }
                result = calculateLCM(value);
                break;

            case 'hcf':
                if (!Array.isArray(value) || !value.every(Number.isInteger)) {
                    return res.status(422).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Value for 'hcf' must be an integer array"
                    });
                }
                if (value.length === 0) {
                    return res.status(400).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Array cannot be empty"
                    });
                }
                result = calculateHCF(value);
                break;

            case 'AI':
                if (typeof value !== 'string') {
                    return res.status(422).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Value for 'AI' must be a string"
                    });
                }
                if (value.trim().length === 0) {
                    return res.status(400).json({
                        is_success: false,
                        official_email: OFFICIAL_EMAIL,
                        error: "Question cannot be empty"
                    });
                }
                result = await getGeminiResponse(value);
                break;

            default:
                return res.status(400).json({ // Using 400 for unknown key
                    is_success: false,
                    official_email: OFFICIAL_EMAIL,
                    error: "Invalid key provided"
                });
        }

        res.json({
            is_success: true,
            official_email: OFFICIAL_EMAIL,
            data: result
        });

    } catch (err) {
        console.error("Internal Error:", err.message);
        // Ensure no stack trace is sent
        res.status(500).json({
            is_success: false,
            official_email: OFFICIAL_EMAIL,
            error: "Internal Server Error"
        });
    }
});

// GET /health
app.get('/health', (req, res) => {
    res.json({
        is_success: true,
        official_email: OFFICIAL_EMAIL
    });
});

// Helper Functions

function generateFibonacci(n) {
    if (n === 0) return [];
    if (n === 1) return [0];

    // Starting [0, 1] per requirements
    const sequence = [0, 1];
    while (sequence.length < n) {
        const next = sequence[sequence.length - 1] + sequence[sequence.length - 2];
        sequence.push(next);
    }
    return sequence.slice(0, n); // Just in case logic slips (which it won't here for n>=2)
}

function isPrime(num) {
    if (num <= 1) return false; // Primes are > 1
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;

    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function calculateHCF(arr) {
    if (arr.length === 0) return 0;
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
        result = gcd(result, arr[i]);
    }
    return result;
}

function lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / gcd(a, b);
}

function calculateLCM(arr) {
    if (arr.length === 0) return 0;
    let result = arr[0];
    for (let i = 1; i < arr.length; i++) {
        result = lcm(result, arr[i]);
    }
    return result;
}

async function getGeminiResponse(question) {
    try {
        const payload = {
            contents: [{
                parts: [{ text: "Answer the following question in one word: " + question }]
            }]
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        // Extract first word
        const candidates = response.data.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content && candidates[0].content.parts.length > 0) {
            const text = candidates[0].content.parts[0].text;
            // Split by whitespace and remove empty strings if any
            const words = text.trim().split(/\s+/);
            if (words.length > 0) {
                return words[0];
            }
        }
        return "NoResponse"; // Fallback if structure is weird but call succeeded
    } catch (error) {
        // Handling API failure safely as requested
        console.error("Gemini API Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error("AI Service Unavailable");
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
