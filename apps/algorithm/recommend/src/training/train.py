import tensorflow as tf
from index import load_data, preprocess_data
from model import RecommenderModel

# Load and preprocess data
data = load_data()
dataset = preprocess_data(data)

# Define and compile model
user_vocab = data["user_id"].unique()
item_vocab = data["product_id"].unique()
model = RecommenderModel(user_vocab, item_vocab)

# Build the model by providing the input shape
model.build(
    input_shape={"user_id": tf.TensorShape([None]), "item_id": tf.TensorShape([None])}
)

# Compile the model
model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))

# Train the model
model.fit(dataset, epochs=500)

# Save the model
model.save("saved_model/recommender_model")
