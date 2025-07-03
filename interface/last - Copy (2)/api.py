import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from similarity import detect_similarity

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'files'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def build_image_path(image_id):
    filename =image_id + '.png'
    return os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
def save_image(file):
    id=str(uuid.uuid4())
    filepath = build_image_path(id)
    file.save(filepath)
    return id


@app.route('/api/upload', methods=['POST'])

def upload_file():
    file = request.files.get('image')
    if file:
        id = save_image(file)
        return jsonify({'id': id}), 200
    else:
        return jsonify({'error': 'No file provided'}), 400

@app.route('/api/compare', methods=['POST'])
def compare_images():
    data = request.json
    real_image = build_image_path(data.get("real_image_id"))
    new_image = build_image_path(data.get("new_image_id"))
    model_similarity = 'models/convnet_best_loss2.pt'
    cos_sim,confidence,label=detect_similarity(model_similarity, real_image, new_image)
    print(real_image)
    print(new_image)
    return jsonify(
            { 
                "similarity": cos_sim, 
                "confidence": confidence, 
                "label": label}
        ), 200
    
if __name__ == '__main__':
    app.run(debug=True)