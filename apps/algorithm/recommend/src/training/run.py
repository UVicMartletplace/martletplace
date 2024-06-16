import pandas as pd
import numpy as np

cosine_similarity_matrix = np.load('cosine_similarity_matrix.npy')
data = pd.read_csv('processed_data.csv')

def get_recommendations(listing_id, similarity_matrix, data, top_n=5):
    idx = data.index[data['listingID'] == listing_id].tolist()[0]
    similarity_scores = list(enumerate(similarity_matrix[idx]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
    similar_listings_indices = [i[0] for i in similarity_scores[1:top_n+1]]
    return data.iloc[similar_listings_indices]

listing_id = 'B07DCVZ2GQ'
recommended_listings = get_recommendations(listing_id, cosine_similarity_matrix, data)
print(recommended_listings)
