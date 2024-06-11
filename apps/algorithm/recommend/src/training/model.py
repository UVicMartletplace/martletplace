import tensorflow as tf
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