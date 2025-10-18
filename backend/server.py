from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import logging
from dotenv import load_dotenv
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)

ALLOWED_ORIGINS = [
    "chrome-extension://johloamompffphdldnmoegjimocmlceo",
]

def check_origin():
    origin = request.headers.get('Origin')
    if not origin or origin not in ALLOWED_ORIGINS:
        logger.warning(f"Blocked request from unauthorized origin: {origin}")
        return jsonify({'error': 'Unauthorized origin'}), 403
    return None

def require_origin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        error_response = check_origin()
        if error_response:
            return error_response
        return f(*args, **kwargs)
    return decorated_function

CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Origin"],
        "supports_credentials": True
    }
})

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Log startup configuration
logger.info("Starting Notion Emoji AI Picker server")
logger.info(f"Environment: {os.getenv('FLASK_ENV', 'development')}")
logger.info(f"OpenAI API Key configured: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")

EMOJI_SUGGESTION_PROMPT = """You are a top-notch Notion expert specialized in selecting emojis for Notion pages based on their titles. Your task is to provide 3 emoji suggestions for a given Notion page title.

# Instructions

1. The user will supply a title of a Notion page.
2. Based on the provided title, suggest three emojis that best fit the theme or tone of the title.
3. Provide only the emoji suggestions as outputs.
4. Each emoji suggestion must be on a separate line.
5. Do not include any additional text other than the emoji suggestions themselves.

# Output Format

- The output should consist solely of three emojis, each on its own line. Do not include any extra words or explanations alongside the emojis.

Please ensure your responses adhere strictly to these guidelines."""

@app.route('/getEmojiSuggestion', methods=['POST'])
@require_origin
def get_emoji_suggestion():
    try:
        logger.info("Received emoji suggestion request")
        data = request.get_json()
        
        if not data or 'title' not in data:
            logger.error("Missing page title in request")
            return jsonify({'error': 'Missing page title'}), 400

        title = data['title']
        logger.info(f"Processing emoji suggestion for title: {title}")
        
        logger.debug("Making OpenAI API request")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": EMOJI_SUGGESTION_PROMPT},
                {"role": "user", "content": title}
            ],
            temperature=0.2
        )
        
        emojis = response.choices[0].message.content.strip().split('\n')
        logger.info(f"Generated emoji suggestions: {emojis}")
        
        return jsonify({'emojis': emojis})

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.after_request
def after_request(response):
    logger.info(f"Response status: {response.status}")
    if not request.headers.get('Origin') in ALLOWED_ORIGINS:
        # If not from allowed origin, clear CORS headers
        response.headers.pop('Access-Control-Allow-Origin', None)
        response.headers.pop('Access-Control-Allow-Credentials', None)
    return response

if __name__ == '__main__':
    logger.info("Server starting on port 5001")
    app.run(host='0.0.0.0', port=5001) 
