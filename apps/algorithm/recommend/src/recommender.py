import pandas as pd
import numpy as np
import tensorflow as tf
import requests
import os


class Recommender:
    def __init__(self):
        self.load_model()

    def download_file(self, url, destination):
        response = requests.get(url)
        response.raise_for_status()
        with open(destination, "wb") as f:
            f.write(response.content)

    def load_model(self, retries=3):
        if(retries < 0):
            exit(1)
        try:
            self.data = pd.read_csv("/app/src/training/processed_data.csv")
            self.cosine_similarity_matrix = np.load(
                "/app/src/training/cosine_similarity_matrix.npy"
            )
            self.normalized_item_vectors = np.load(
                "/app/src/training/normalized_item_vectors.npy"
            )
        except FileNotFoundError:
            os.makedirs("/app/src/training", exist_ok=True)
            data_url = "https://github.com/UVicMartletplace/martletplace/releases/download/recommender-v1.0.1/processed_data.csv"
            cosine_url = "https://github.com/UVicMartletplace/martletplace/releases/download/recommender-v1.0.1/cosine_similarity_matrix.npy"
            item_vectors_url = "https://github.com/UVicMartletplace/martletplace/releases/download/recommender-v1.0.1/normalized_item_vectors.npy"

            self.download_file(data_url, "/app/src/training/processed_data.csv")
            self.download_file(
                cosine_url, "/app/src/training/cosine_similarity_matrix.npy"
            )
            self.download_file(
                item_vectors_url, "/app/src/training/normalized_item_vectors.npy"
            )

            self.load_model(retries-1)
            return
        except Exception as _:
            self.load_model(retries-1)

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
        if click_recommendations.size == 0 and search_recommendations.size == 0:
            return np.array([])
        elif click_recommendations.size == 0:
            return self.data.iloc[search_recommendations[:limit]]
        elif search_recommendations.size == 0:
            return self.data.iloc[click_recommendations[:limit]]
        else:
            combined_recommendations = pd.concat(
                [
                    self.data.iloc[click_recommendations[:limit]],
                    self.data.iloc[search_recommendations[:limit]],
                ]
            )
            # shuffle recommendations
            combined_recommendations = combined_recommendations.sample(frac=1)
            return combined_recommendations[:limit]

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
        if not items_clicked:
            return np.array([])
        indices = self.data.index[self.data["listing_id"].isin(items_clicked)].tolist()
        similarities = np.mean(self.cosine_similarity_matrix[indices], axis=0)
        recommendations = np.argsort(similarities)[::-1]
        # Remove items that have already been clicked
        # Not sure if we want to do this or if we want to recommend stuff that has already been looked at?
        # Needs to happen before taking the top_n, otherwise we aren't guaranteed to get top_n recommendations
        recommendations = np.array([i for i in recommendations if i not in indices])
        return recommendations

    def get_recommendations_from_search_terms(self, search_terms):
        """
        Get recommendations based on search terms. Works just like how training
        the recommender works, by calculating the "similarity" of the search
        terms to the items in the data, and then returning the most similar items.
        """
        if not search_terms:
            return np.array([])
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
        top_indices = np.argsort(similarities)[::-1]
        return top_indices
