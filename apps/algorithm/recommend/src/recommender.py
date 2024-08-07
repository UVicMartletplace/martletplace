import pandas as pd
import numpy as np
import tensorflow as tf

PROCESSED_DATA_URL = "processed_data.csv"
COSINE_URL = "cosine_similarity_matrix.npy"
ITEM_VECTORS_URL = "normalized_item_vectors.npy"
TRAINING_DIR = "/app/training/"


class Recommender:
    def __init__(self):
        self.load_model()

    def load_model(self, retries=5):
        self.data = pd.read_csv(TRAINING_DIR + PROCESSED_DATA_URL)
        self.cosine_similarity_matrix = np.load(TRAINING_DIR + COSINE_URL)
        self.normalized_item_vectors = np.load(TRAINING_DIR + ITEM_VECTORS_URL)

    def recommend(
        self,
        items_clicked,
        terms_searched,
        items_disliked,
        page,
        limit,
        ignore_charity_listings=False,
    ):
        """
        Recommend items to the user based on the items they've clicked and the
        terms they've searched. The recommendations are sorted by relevance, and
        then paginated and returned.

        Recommendations are guaranteed to be unique.
        """
        dislike_vectors = self.get_vectors_by_id(items_disliked)
        item_clicked_vectors = self.get_vectors_by_content(items_clicked)
        search_term_vectors = self.get_vectors_by_content(terms_searched)
        recommendations = item_clicked_vectors + search_term_vectors - dislike_vectors
        recommendations = tf.nn.l2_normalize(recommendations, axis=1)

        similarities = (
            tf.matmul(recommendations, tf.transpose(self.normalized_item_vectors))
            .numpy()
            .flatten()
        )
        top_indices = np.argsort(similarities)[::-1]

        recommended_data = self.data.iloc[top_indices]

        if ignore_charity_listings:
            # Filter out charity listings if the user doesn't want to see them
            recommended_data = recommended_data[recommended_data["charity_id"].isnull()]

        start_index = (page - 1) * limit
        end_index = page * limit
        return recommended_data.iloc[start_index:end_index]

    @staticmethod
    def generate_tfidf_vector(texts, data):
        tokenizer = tf.keras.preprocessing.text.Tokenizer()
        tokenizer.fit_on_texts(data["combined_features"])
        all_sequences = tokenizer.texts_to_sequences(data["combined_features"])

        sequences = tokenizer.texts_to_sequences(texts)
        padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(sequences)
        vocab_size = len(tokenizer.word_index) + 1
        tfidf_matrix = np.zeros((len(padded_sequences), vocab_size), np.float32)

        data_size = len(data)
        for i, seq in enumerate(padded_sequences):
            word_freq = dict(zip(*np.unique(seq, return_counts=True)))
            doc_len = len(seq)
            for word, freq in word_freq.items():
                if word == 0:
                    continue
                tf_value = freq / doc_len
                idf_value = np.log(
                    (data_size + 1) / (1 + sum([1 for s in all_sequences if word in s]))
                )
                tfidf_matrix[i, word] = tf_value * idf_value

        return tf.convert_to_tensor(tfidf_matrix, dtype=tf.float32)

    def get_vectors_by_id(self, listing_ids):
        if not listing_ids:
            return np.zeros((1, self.normalized_item_vectors.shape[1]), np.float32)
        listing_indices = self.data.index[
            self.data["listing_id"].isin(listing_ids)
        ].tolist()

        listing_indices = tf.convert_to_tensor(listing_indices, dtype=tf.int32)

        listing_vectors = tf.gather(
            self.normalized_item_vectors, listing_indices, axis=0
        )
        mean_vectors = tf.reduce_mean(listing_vectors, axis=0, keepdims=True)
        return tf.nn.l2_normalize(mean_vectors, axis=1)

    def get_vectors_by_content(self, content):
        if not content:
            return np.zeros((1, self.normalized_item_vectors.shape[1]), np.float32)
        tfidf_tensor = Recommender.generate_tfidf_vector(content, self.data)
        aggregated_vector = tf.reduce_mean(tfidf_tensor, axis=0, keepdims=True)
        return tf.nn.l2_normalize(aggregated_vector, axis=1)
