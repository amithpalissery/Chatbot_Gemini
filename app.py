from flask import Flask, render_template, request
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)

# Configure the Gemini API with your API key
# The API key should be stored in your .env file as GOOGLE_API_KEY
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the Gemini model
# You can use a different model name like 'gemini-1.5-pro' or 'gemini-1.0-pro'
# if you prefer.
model = genai.GenerativeModel('gemini-1.5-flash')

# Store chat history
chat_history = []

# This route handles the root URL '/'
@app.route('/')
def home():
    return render_template('question.html', chat_history=chat_history)

# This route handles the '/chatbot' URL
@app.route('/chatbot', methods=['GET', 'POST'])
def chatbot():
    global chat_history
    chat_response = ""

    if request.method == 'POST':
        question = request.form.get('question')
        if question:
            try:
                # Use the Gemini model to generate a response
                response = model.generate_content(question)
                chat_response = response.text
                
                chat_history.append({'sender': 'user', 'message': question})
                chat_history.append({'sender': 'bot', 'message': chat_response})
            except Exception as e:
                print("Error occurred:", e)
                chat_response = f"Sorry, an error occurred: {e}"
        else:
            chat_response = "Please enter a question."

    return render_template('question.html', chat_response=chat_response, chat_history=chat_history)

if __name__ == '__main__':
    # Binds the application to all network interfaces, which is necessary for EC2.
    # The application will be accessible via the instance's public IP.
    app.run(host='0.0.0.0', debug=True, port=5000)