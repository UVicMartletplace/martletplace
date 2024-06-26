import asyncio
import pandas as pd
from sqlalchemy import text
import tensorflow as tf
import numpy as np
import src.db as db

# Confirms if your computer is ideally using a GPU-accelerated version of TensorFlow.
print("Num GPUs Available: ", len(tf.config.list_physical_devices("GPU")))

async def main():
    session = await db.get_async_session()
    listings = await session.exec(text("SELECT * FROM listings"))
    data = pd.DataFrame(listings)

    await session.close()

    target_columns = ["title", "description", "price"]
    data["combined_features"] = data[target_columns].astype(str).apply(" ".join, axis=1)

    tokenizer = tf.keras.preprocessing.text.Tokenizer()
    tokenizer.fit_on_texts(data["combined_features"])
    vocab_size = len(tokenizer.word_index) + 1

    sequences = tokenizer.texts_to_sequences(data["combined_features"])

    tfidf_matrix = np.zeros((len(data), vocab_size))

    for i, seq in enumerate(sequences):
        print("iteration: " + str(i) + " out of: " + str(len(sequences)))
        word_freq = dict(zip(*np.unique(seq, return_counts=True)))
        doc_len = len(seq)
        for word, freq in word_freq.items():
            tf_value = freq / doc_len
            idf_value = np.log(len(data) / (1 + sum([1 for s in sequences if word in s])))
            tfidf_matrix[i, word] = tf_value * idf_value

    tfidf_tensor = tf.convert_to_tensor(tfidf_matrix, dtype=tf.float32)

    normalized_vectors = tf.nn.l2_normalize(tfidf_tensor, axis=1)
    # save normalized vectors
    np.save("normalized_item_vectors.npy", normalized_vectors.numpy())

    cosine_similarity_matrix = tf.matmul(
        normalized_vectors, normalized_vectors, transpose_b=True
    )

    cosine_similarity_matrix = cosine_similarity_matrix.numpy()

    np.save("cosine_similarity_matrix.npy", cosine_similarity_matrix)
    data.to_csv("processed_data.csv", index=False)


asyncio.run(main())
