import pandas as pd
import numpy as np

cosine_similarity_matrix = np.load("cosine_similarity_matrix.npy")
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
