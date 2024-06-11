import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow import keras
import tensorflow_recommenders as tfrs
from typing import Dict

class RecommenderModel(tfrs.Model):
    def __init__(self, user_model: tf.keras.Model, item_model: tf.keras.Model, task: tfrs.tasks.Retrieval):
        super().__init__()
        self.user_model = user_model
        self.item_model = item_model
        self.task = task

    def compute_loss(self, features: Dict[str, tf.Tensor], training=False) -> tf.Tensor:
        user_embeddings = self.user_model(features["user_id"])
        item_embeddings = self.item_model(features["item_id"])

        return self.task(user_embeddings, item_embeddings)

print("Reading the data")

# Load data
ratings_df = pd.read_json('ratings.jsonl', lines=True)
metadata_df = pd.read_json('metadata.jsonl', lines=True)

# Just use a small amount of the data for testing
ratings_df = ratings_df.sample(frac=0.01, random_state=42)
metadata_df = metadata_df.sample(frac=0.01, random_state=42)

ratings_df = ratings_df[["parent_asin", "user_id", "rating"]]
metadata_df = metadata_df[["parent_asin"]]

ratings_df['parent_asin'] = ratings_df['parent_asin'].astype(str)
ratings_df['user_id'] = ratings_df['user_id'].astype(str)
metadata_df['parent_asin'] = metadata_df['parent_asin'].astype(str)

# Convert DataFrames to TensorFlow datasets
ratings_dataset = tf.data.Dataset.from_tensor_slices(dict(ratings_df))
metadata_dataset = tf.data.Dataset.from_tensor_slices(dict(metadata_df))

# Map the datasets to select the basic features
ratings = ratings_dataset.map(lambda x: {
    "item_id": x["parent_asin"],
    "user_id": x["user_id"],
    "rating": x["rating"]
})

metadata = metadata_dataset.map(lambda x: {
    "item_id": x["parent_asin"]
})

print("Getting vocabularies")

user_ids_vocabulary = tf.keras.layers.StringLookup()
user_ids_vocabulary.adapt(ratings.map(lambda x: x["user_id"]).batch(1000))

items_vocabulary = tf.keras.layers.StringLookup()
items_vocabulary.adapt(metadata.map(lambda x: x["item_id"]).batch(1000))

print("Training the model")

# Define the models
user_model = tf.keras.Sequential([
    user_ids_vocabulary,
    tf.keras.layers.Embedding(user_ids_vocabulary.vocab_size(), 64)
])

item_model = tf.keras.Sequential([
    items_vocabulary,
    tf.keras.layers.Embedding(items_vocabulary.vocab_size(), 64)
])

task = tfrs.tasks.Retrieval(metrics=tfrs.metrics.FactorizedTopK(
    metadata.batch(128).map(lambda x: item_model(x["item_id"]))
))

# Create an item retrieval model
model = RecommenderModel(user_model, item_model, task)
model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))

# Train the model
model.fit(ratings.batch(4096), epochs=3)

print("Saving the model")
model.save("content_model", save_format='tf')

print("Grabbing recommendations")

# Use brute-force search to set up retrieval using the trained representations
index = tfrs.layers.factorized_top_k.BruteForce(model.user_model)
index.index_from_dataset(
    metadata.batch(100).map(lambda x: (x["item_id"], model.item_model(x["item_id"]))))

# Get some recommendations
_, titles = index(np.array(["42"]))
print(f"Top 3 recommendations for user 42: {titles[0, :3]}")
