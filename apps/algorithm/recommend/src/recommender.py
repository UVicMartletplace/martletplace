def recommend_items(user_id : str, num_recommendations : int = 20):
    user_row_number = user_item_matrix.index.get_loc(user_id)
    sorted_user_predictions = predicted_ratings_df.iloc[user_row_number].sort_values(ascending=False)
    
    # Get the user's data and merge with predicted ratings
    user_data = df[df.user_id == user_id]
    user_full = (user_data.merge(pd.DataFrame(sorted_user_predictions).reset_index(), how='left', left_on='asin', right_on='asin')
                 .rename(columns={user_row_number: 'PredictedRating'})
                 .sort_values('PredictedRating', ascending=False))
    
    print(f'User {user_id} has already rated {user_full.shape[0]} items.')
    print(f'Recommending the highest {num_recommendations} predicted ratings not already rated.')
    
    recommendations = sorted_user_predictions[~sorted_user_predictions.index.isin(user_full['asin'])].head(num_recommendations)
    
    return recommendations