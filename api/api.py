from flask import Flask, request, jsonify
import google.generativeai as genai
from pathlib import Path
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv('.flaskenv')

# Configure API and upload settings
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), UPLOAD_FOLDER)

MODEL_CONFIG = {
    "temperature": 0.2,
    "top_p": 1,
    "top_k": 32,
    "max_output_tokens": 4096,
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE",
    }
]

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash-image",
    generation_config=MODEL_CONFIG,
    safety_settings=safety_settings
)

def image_format(file_path):
    file = Path(file_path)
    if not file.exists():
        raise FileNotFoundError(f"Could not find file: {file}")

    extension = file.suffix.lower()
    mime_types = {
        '.pdf': 'application/pdf',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.png': 'image/png'
    }

    if extension not in mime_types:
        raise ValueError(f"Unsupported file format: {extension}. Supported formats are: PDF, JPEG, PNG")

    return [{
        "mime_type": mime_types[extension],
        "data": file.read_bytes()
    }]

def process_invoice(file_path):
    try:
        image_info = image_format(file_path)
        system_prompt = """
        You are a specialist in comprehending receipts.
        Input images in the form of receipts will be provided to you,
        and your task is to respond to questions based on the content of the input image.
        """
        user_prompt = "Convert Invoice data into json format with appropriate json tags as required for the data in image"
        
        input_prompt = [system_prompt, image_info[0], user_prompt]
        response = model.generate_content(input_prompt)
        return response.text if response else "No response from the model."
    except Exception as e:
        return str(e)

@app.route('/api/extract', methods=['POST'])
def extract_invoice():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            result = process_invoice(filepath)
            print("Extraction result:", result)
            return jsonify({'result': result})
        
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)