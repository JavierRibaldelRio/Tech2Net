import random
import pandas as pd


def load_matrix(
    file_path,
    company_col_indices=None,
    speaker_col_indices=None,
    shuffle_companies=False,
    shuffle_speakers=False,
    seed=None,
):
    """Load a company/speaker matrix from a CSV.

    Args:
        file_path: Path to the CSV file.
        company_col_indices: Optional list of 1-based column numbers (from the CSV)
            that identify the company/person. If None, column 1 is used.
        speaker_col_indices: Optional list of 1-based column numbers (from the CSV) that
            correspond to speaker columns. If None, all columns after the company columns
            are used.
        shuffle_companies: If True, shuffle the order of companies.
        shuffle_speakers: If True, shuffle the order of speaker columns.
        seed: Optional random seed for deterministic shuffling.

    Returns:
        A dict with keys "companies", "speakers", and "matrix".
    """

    df = pd.read_csv(file_path)

    if seed is not None:
        rng = random.Random(seed)
    else:
        rng = random.Random()

    max_idx = len(df.columns)

    # Determine which columns represent the company/person identifier.
    if company_col_indices is None:
        company_col_indices = [1]

    company_cols = []
    for idx in company_col_indices:
        if idx < 1 or idx > max_idx:
            raise ValueError(
                f"company_col_indices values must be between 1 and {max_idx} (inclusive); got {idx}"
            )
        company_cols.append(df.columns[idx - 1])

    # Determine which columns represent speaker availability.
    if speaker_col_indices is None:
        # All columns after the maximum company column index.
        speaker_col_indices = list(range(max(company_col_indices) + 1, max_idx + 1))

    speaker_cols = []
    for idx in speaker_col_indices:
        if idx < 1 or idx > max_idx:
            raise ValueError(
                f"speaker_col_indices values must be between 1 and {max_idx} (inclusive); got {idx}"
            )
        if idx in company_col_indices:
            raise ValueError(
                f"speaker_col_indices must not include company columns: {company_col_indices}; got {idx}"
            )
        speaker_cols.append(df.columns[idx - 1])

    if shuffle_companies:
        company_indices = list(df.index)
        rng.shuffle(company_indices)
        df = df.iloc[company_indices].reset_index(drop=True)

    # Keep only the selected speaker columns.
    df_speakers = df[speaker_cols].copy()

    if shuffle_speakers:
        rng.shuffle(speaker_cols)
        df_speakers = df_speakers[speaker_cols]

    companies = df[company_cols].astype(str).agg("-".join, axis=1).tolist()
    speakers = speaker_cols[:]

    matrix = {}

    for c_idx, c in enumerate(companies):
        for s_idx, s in enumerate(speakers):
            val = df_speakers.iloc[c_idx, s_idx]
            if pd.notna(val) and val not in (0, "", False):
                # print relation
                print(f"Company '{c}' is interested in speaker '{s}'")
                matrix.setdefault(s, []).append(c)

    return {"companies": companies, "speakers": speakers, "matrix": matrix}
