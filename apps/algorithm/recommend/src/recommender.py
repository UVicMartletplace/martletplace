import pandas as pd
import numpy as np
import tensorflow as tf


class Recommender:
    def __init__(self):
        self.load_model()

    def load_model(self):
        self.data = pd.read_csv("/app/src/training/processed_data.csv")
        self.cosine_similarity_matrix = np.load(
            "/app/src/training/cosine_similarity_matrix.npy"
        )
        self.normalized_item_vectors = np.load(
            "/app/src/training/normalized_item_vectors.npy"
        )

    def recommend(self, items_clicked, terms_searched, page, limit):
        """
        Recommend items to the user based on the items they've clicked and the
        terms they've searched. The recommendations are sorted by relevance, and
        then paginated and returned.

        Recommendations are guaranteed to be unique.
        """
        click_recommendations = self.get_recommendations_by_items_clicked(items_clicked)
        search_recommendations = self.get_recommendations_from_search_terms(
            terms_searched
        )
        combined_recommendations = np.concatenate(
            [click_recommendations, search_recommendations]
        )
        unique_recommendations, counts = np.unique(
            combined_recommendations, return_counts=True
        )
        top_indices = np.argsort(counts)[::-1]

        start_index = (page - 1) * limit
        if start_index >= len(unique_recommendations):
            return np.array([])

        end_index = start_index + limit
        end_index = min(end_index, len(unique_recommendations))

        paged_recommendations = unique_recommendations[top_indices][
            start_index:end_index
        ]
        return self.data.iloc[paged_recommendations]

    @staticmethod
    def generate_tfidf_vector(texts, data):
        tokenizer = tf.keras.preprocessing.text.Tokenizer()
        tokenizer.fit_on_texts(data["combined_features"])
        all_sequences = tokenizer.texts_to_sequences(data["combined_features"])

        sequences = tokenizer.texts_to_sequences(texts)
        padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(sequences)
        vocab_size = len(tokenizer.word_index) + 1
        tfidf_matrix = np.zeros((len(padded_sequences), vocab_size))

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

    def get_recommendations_by_items_clicked(self, items_clicked):
        """
        Get recommendations based on items clicked. Works by taking the mean of
        the cosine similarity of each of the items clicked then returning the
        recommendations based on the highest similarities.
        """
        indices = self.data.index[self.data["listingID"].isin(items_clicked)].tolist()
        similarities = np.mean(self.cosine_similarity_matrix[indices], axis=0)
        # Remove items that have already been clicked
        # Not sure if we want to do this or if we want to recommend stuff that has already been looked at?
        # Needs to happen before taking the top_n, otherwise we aren't guaranteed to get top_n recommendations
        similarities = [i for i in similarities if i not in indices]
        return similarities

    def get_recommendations_from_search_terms(self, search_terms):
        """
        Get recommendations based on search terms. Works just like how training
        the recommender works, by calculating the "similarity" of the search
        terms to the items in the data, and then returning the most similar items.
        """
        search_tfidf_tensor = Recommender.generate_tfidf_vector(search_terms, self.data)
        normalized_search_vectors = tf.nn.l2_normalize(search_tfidf_tensor, axis=1)
        aggregated_search_vector = tf.reduce_mean(
            normalized_search_vectors, axis=0, keepdims=True
        )
        similarities = (
            tf.matmul(
                aggregated_search_vector, tf.transpose(self.normalized_item_vectors)
            )
            .numpy()
            .flatten()
        )
        return similarities
