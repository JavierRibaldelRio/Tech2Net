import random
import pandas as pd


def load_matrix(file_path, shuffle_companies=False, shuffle_speakers=False, seed=None):
    df = pd.read_csv(file_path)

    if seed is not None:
        rng = random.Random(seed)
    else:
        rng = random.Random()

    company_col = df.columns[0]
    speaker_cols = list(df.columns[1:])

    if shuffle_companies:
        company_indices = list(df.index)
        rng.shuffle(company_indices)
        df = df.iloc[company_indices].reset_index(drop=True)

    if shuffle_speakers:
        shuffled_speakers = speaker_cols[:]
        rng.shuffle(shuffled_speakers)
        df = df[[company_col] + shuffled_speakers]

    companies = df.iloc[:, 0].tolist()
    speakers = df.columns[1:].tolist()

    matrix = {}

    for c_idx, c in enumerate(companies):
        for s_idx, s in enumerate(speakers):
            if df.iloc[c_idx, s_idx + 1] == 1:
                matrix.setdefault(s, []).append(c)

    return {
        "companies": companies,
        "speakers": speakers,
        "matrix": matrix
    }