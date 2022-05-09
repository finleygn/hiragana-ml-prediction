from flask import Flask, jsonify, request
import tensorflow as tf
from flask_cors import CORS
import os

model = tf.keras.models.load_model(os.path.join(
    os.environ["DATA_DIR"],
    'out.h5'
), compile=True)

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})

@app.route("/")
def index():
    stringlist = []
    model.summary(print_fn=lambda x: stringlist.append(x))
    short_model_summary = "\n".join(stringlist)
    return f"<pre>{short_model_summary}</pre>"

@app.route("/predict", methods=['POST'])
def predict():
    content = tf.reshape(tf.constant(request.json), [256, 256, 4])
    content = tf.image.resize(content, [64, 64])

    resp = model(tf.expand_dims(content, 0))
    return jsonify(resp[0].numpy().tolist())