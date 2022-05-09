# TensorFlow and tf.keras
import math
import os
import tensorflow as tf

# Helper libraries
from PIL import Image
import glob
import numpy as np

CHARS = [
  "あ", "い", "う", "え", "お", "か", "が", "き", "ぎ", "く",
  "ぐ", "け", "げ", "こ", "ご", "さ", "ざ", "し", "じ", "す",
  "ず", "せ", "ぜ", "そ", "ぞ", "た", "だ", "ち", "ぢ", "っ",
  "づ", "て", "で", "と", "ど", "な", "に", "ぬ", "ね", "の",
  "は", "ば", "ぱ", "ひ", "び", "ぴ", "ふ", "ぶ", "ぷ", "へ",
  "べ", "ぺ", "ほ", "ぼ", "ぽ", "ま", "み", "む", "め", "も",
  "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "ゐ",
  "ゑ", "を", "ん"
]

CHAR_SIZE = 64
IMAGE_COLS = 10
IMAGE_ROWS = math.ceil(len(CHARS) / IMAGE_COLS)

def list_files():
  files = []

  for file in glob.glob(os.path.join(os.environ["DATA_DIR"], 'images/*.png')):
    files.append(file)

  return files

# Split tiled image into tiles
def split_image(file, tile_count, cols, tile_size):
  tiles = []

  img = Image.open(file)

  for tile in range(tile_count):
    row_px_start = math.floor(tile / cols) * tile_size
    col_px_start = tile % cols * tile_size

    tiles.append(
      img.crop((
        col_px_start, row_px_start,
        col_px_start + tile_size, row_px_start + tile_size
      ))
    )

  return tiles

# Create numpy ndarray for features and labels, features containing tensor for each
def build_from_files(files, charset, cols, tile_size):
  features = np.empty(
    shape=(len(files)*len(charset), tile_size, tile_size, 4),
    dtype=float
  )
  
  labels = np.zeros(
    shape=len(files)*len(charset),
    dtype=int
  )

  for file_index, file in enumerate(files):
    image_tiles = split_image(file, len(charset), cols, tile_size)
    start_index = file_index * len(charset)

    for tile_index, tile in enumerate(image_tiles):
      labels[tile_index + start_index] = tile_index

      features[tile_index + start_index] = tile

  return features, labels

def load_dataset():
  files = list_files()

  training_ratio = 0.8
  training_items = math.floor(len(files) * training_ratio)
  
  training_files = files[:training_items]
  testing_files = files[training_items:]

  testing = build_from_files(
    testing_files,
    CHARS,
    IMAGE_COLS,
    CHAR_SIZE
  )
  
  training = build_from_files(
    training_files,
    CHARS,
    IMAGE_COLS,
    CHAR_SIZE
  )

  return training, testing

(training_f, training_l), (testing_f, testing_l) = load_dataset()

training_f = training_f / 255.
testing_f = testing_f / 255.

model = tf.keras.Sequential([
  tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(64, 64, 4)),
  tf.keras.layers.MaxPooling2D((2, 2)),
  tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
  tf.keras.layers.MaxPooling2D((2, 2)),
  tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
  tf.keras.layers.Flatten(),
  tf.keras.layers.Dense(64, activation='relu'),
  tf.keras.layers.Dense(len(CHARS))
])

model.summary()

model.compile(
  optimizer='adam',
  loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
  metrics=['accuracy']
)

model.fit(training_f, training_l, epochs=10)
model.evaluate(testing_f, testing_l)

model.save(os.path.join(os.environ["DATA_DIR"], "out.h5"))