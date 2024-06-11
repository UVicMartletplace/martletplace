import tensorflow as tf
import tensorflow_recommenders as tfrs

class RecommenderModel(tfrs.Model):
    def __init__(self, user_vocab, item_vocab):
        super().__init__()
        embedding_dim = 32

        # User and item embeddings
        self.user_embeddings = tf.keras.Sequential([
            tf.keras.layers.StringLookup(vocabulary=user_vocab, mask_token=None),
            tf.keras.layers.Embedding(len(user_vocab) + 1, embedding_dim)
        ])

        self.item_embeddings = tf.keras.Sequential([
            tf.keras.layers.StringLookup(vocabulary=item_vocab, mask_token=None),
            tf.keras.layers.Embedding(len(item_vocab) + 1, embedding_dim)
        ])

        # Rating prediction
        self.rating_model = tf.keras.Sequential([
            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(1)
        ])

        # Loss
        self.task = tfrs.tasks.Ranking(
            loss=tf.keras.losses.MeanSquaredError(),
            metrics=[tf.keras.metrics.RootMeanSquaredError()]
        )

    def call(self, inputs):
        user_ids = tf.cast(inputs['user_id'], tf.string)
        item_ids = tf.cast(inputs['item_id'], tf.string)

        user_embeddings = self.user_embeddings(user_ids)
        item_embeddings = self.item_embeddings(item_ids)

        rating_predictions = self.rating_model(tf.concat([user_embeddings, item_embeddings], axis=1))
        return rating_predictions

    def compute_loss(self, features, training=False):
        labels = features.pop('rating')
        predictions = self(features)
        return self.task(
            labels=labels,
            predictions=predictions
        )
