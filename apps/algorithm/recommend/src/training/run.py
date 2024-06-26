import pandas as pd
import numpy as np
import tensorflow as tf


def generate_tfidf_vector(texts, data_size):
    tokenizer = tf.keras.preprocessing.text.Tokenizer()
    tokenizer.fit_on_texts(data["combined_features"])
    all_sequences = tokenizer.texts_to_sequences(data["combined_features"])

    sequences = tokenizer.texts_to_sequences(texts)
    padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(sequences)
    vocab_size = len(tokenizer.word_index) + 1
    tfidf_matrix = np.zeros((len(padded_sequences), vocab_size))

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


cosine_similarity_matrix = np.load("cosine_similarity_matrix.npy")
normalized_item_vectors = np.load("normalized_item_vectors.npy")
data = pd.read_csv("processed_data.csv")


def get_recommendations_by_items_clicked(
    items_clicked, similarity_matrix, data, top_n=5
):
    indices = data.index[data["listingID"].isin(items_clicked)].tolist()
    similatiries = np.mean(similarity_matrix[indices], axis=0)
    recommendations = np.argsort(similatiries)[::-1]
    # Remove items that have already been clicked
    # Not sure if we want to do this or if we want to recommend stuff that has already been looked at?
    # Needs to happen before taking the top_n, otherwise we aren't guaranteed to get top_n recommendations
    recommendations = [i for i in recommendations if i not in indices]
    return data.iloc[recommendations[:top_n]]


def get_recommendations_from_search_terms(search_terms, data, top_n=5):
    search_tfidf_tensor = generate_tfidf_vector(search_terms, len(data))
    normalized_search_vectors = tf.nn.l2_normalize(search_tfidf_tensor, axis=1)
    aggregated_search_vector = tf.reduce_mean(
        normalized_search_vectors, axis=0, keepdims=True
    )
    cosine_similarities = (
        tf.matmul(aggregated_search_vector, tf.transpose(normalized_item_vectors))
        .numpy()
        .flatten()
    )
    top_indices = np.argsort(cosine_similarities)[-top_n:]
    return data.iloc[top_indices]


search_terms = ["cream", "chocolate", "face"]
print("Getting recommendations for searched terms: ", search_terms)
recommended_listings = get_recommendations_from_search_terms(search_terms, data)
print(recommended_listings)


def get_recommendations(listing_id, similarity_matrix, data, top_n=5):
    idx = data.index[data["listingID"] == listing_id].tolist()[0]
    similarity_scores = list(enumerate(similarity_matrix[idx]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
    similar_listings_indices = [i[0] for i in similarity_scores[1 : top_n + 1]]
    return data.iloc[similar_listings_indices]


print("Getting recommendations for just one listing (soup)")
listing_ids = ["B07DCVZ2GQ"]
recommended_listings = get_recommendations_by_items_clicked(
    listing_ids, cosine_similarity_matrix, data
)
print(recommended_listings)

print("Getting recommendations based on items clicked (face products)")
listing_ids = ["B07QDTZYSJ", "B072BGHNJ1", "B07H4LV2VS"]
recommended_listings = get_recommendations_by_items_clicked(
    listing_ids, cosine_similarity_matrix, data
)
print(recommended_listings)
