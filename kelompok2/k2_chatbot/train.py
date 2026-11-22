import argparse
import json
import re
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

SEQ_LEN = 16
EMBED_DIM = 16
HIDDEN_DIM = 24
EPOCHS = 80
BATCH_SIZE = 16
SEED = 42

tf.keras.utils.set_random_seed(SEED)


def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def build_vocab(texts):
    vocab = {"<PAD>": 0, "<OOV>": 1}
    idx = 2
    for text in texts:
        for word in clean_text(text).split():
            if word not in vocab:
                vocab[word] = idx
                idx += 1
    return vocab


def encode_texts(texts, vocab):
    encoded = np.zeros((len(texts), SEQ_LEN), dtype=np.int32)
    for i, text in enumerate(texts):
        words = clean_text(text).split()
        for j, word in enumerate(words[:SEQ_LEN]):
            encoded[i, j] = vocab.get(word, 1)
    return encoded


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="data.csv", help="Path ke dataset CSV")
    args = parser.parse_args()

    df = pd.read_csv(args.data).dropna(subset=["text", "intent"])
    df["text"] = df["text"].astype(str)
    df["intent"] = df["intent"].astype(str).str.strip()

    labels = sorted(df["intent"].unique())
    label2id = {label: idx for idx, label in enumerate(labels)}
    num_classes = len(labels)

    X_raw = df["text"].tolist()
    y = np.array([label2id[label] for label in df["intent"]], dtype=np.int32)

    X_train_raw, X_val_raw, y_train, y_val = train_test_split(
        X_raw,
        y,
        test_size=0.2,
        random_state=SEED,
        stratify=y,
    )

    vocab = build_vocab(X_train_raw)
    X_train = encode_texts(X_train_raw, vocab)
    X_val = encode_texts(X_val_raw, vocab)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(SEQ_LEN,), dtype=tf.int32),
        tf.keras.layers.Embedding(input_dim=len(vocab) + 1, output_dim=EMBED_DIM),
        tf.keras.layers.GlobalAveragePooling1D(),
        tf.keras.layers.Dense(HIDDEN_DIM, activation="relu"),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(num_classes, activation="softmax"),
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.01),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=12,
        restore_best_weights=True,
    )

    model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=[early_stop],
        verbose=0,
    )

    val_preds = np.argmax(model.predict(X_val, verbose=0), axis=1)
    acc = float(accuracy_score(y_val, val_preds))
    macro_f1 = float(f1_score(y_val, val_preds, average="macro", zero_division=0))

    print(f"[eval] acc={acc:.4f} macro_f1={macro_f1:.4f}")

    # Konversi ke model.tflite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()
    with open("model.tflite", "wb") as f:
        f.write(tflite_model)

    with open("vocab.json", "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False, indent=2)

    metrics = {
        "accuracy": round(acc, 4),
        "macro_f1": round(macro_f1, 4),
        "seq_len": SEQ_LEN,
        "vocab_size": len(vocab),
        "num_classes": num_classes,
        "labels": label2id,
    }
    with open("metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    print("[ok] tersimpan: model.tflite, vocab.json, metrics.json")


if __name__ == "__main__":
    main()