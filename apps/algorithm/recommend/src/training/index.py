import tensorflow as tf
import pandas as pd

def load_data():
    data = pd.read_csv('amazon.csv')
    data['user_id'] = data['user_id'].astype(str)
    data['product_id'] = data['product_id'].astype(str)
    data['rating'] = data['rating'].astype(float)
    return data

def preprocess_data(data):
    dataset = tf.data.Dataset.from_tensor_slices({
        'user_id': data['user_id'].values,
        'item_id': data['product_id'].values,
        'rating': data['rating'].values
    })
    dataset = dataset.shuffle(len(data)).batch(128).cache()
    return dataset