import pandas as pd
import sqlite3
from pathlib import Path


DATABASE_PATH = Path(__file__).resolve().parents[1] / "study_notes.db"
NOTE_COLUMNS = (
    "user_id",
    "note_id",
    "title",
    "subject",
    "content",
    "analysis_result",
    "summary_result",
    "key_concepts",
    "quiz",
    "created_at",
    "updated_at",
)

def fetch_data_from_db():
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.execute(
            f"SELECT {', '.join(NOTE_COLUMNS)} FROM notes"
        )
        return cursor.fetchall()

def save_results_to_csv(results, filename='tests/results.csv'):
    df = pd.DataFrame(results, columns=NOTE_COLUMNS)
    # Save the DataFrame to a CSV file
    df.to_csv(filename, index=False)
    return df

if __name__ == "__main__":
    results = fetch_data_from_db()
    df = save_results_to_csv(results)
    print("Data saved to results.csv")