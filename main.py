from input import load_matrix
from optimizer import optimize
from pdf_report import generate_pdf

INPUT_FILE = "balanced-test.csv"
# Columns are 1-based.
# Columns 1..2 are used to build the company/person identifier (origin + persona).
# The remaining columns are speaker availability columns.
COMPANY_COL_INDICES = [1, 2]
SPEAKER_COL_INDICES = list(range(3, 11))

TIME_SLOTS = ["10:00–10:15", "10:20–10:35", "10:40–10:55", "11:00–11:15", "11:20–11:35"]

# Display titles used in report tables
TIME_TITLE = "Hora"
COMPANY_TITLE = "Asistente"
SPEAKER_TITLE = "Ponente"


def main():

    data = load_matrix(
        INPUT_FILE,
        company_col_indices=COMPANY_COL_INDICES,
        speaker_col_indices=SPEAKER_COL_INDICES,
        shuffle_companies=True,
        shuffle_speakers=True,
        seed=42,
    )
    schedule, stats = optimize(data, len(TIME_SLOTS))

    print("Reuniones:", stats["meetings"])
    print("speakers cubiertos:", stats["speakers_covered"])
    print("Empresas cubiertas:", stats["companies_covered"])
    print("Optimal:", stats["optimal"])

    generate_pdf(
        schedule,
        stats,
        TIME_SLOTS,
        "agenda.pdf",
        time_title=TIME_TITLE,
        speaker_title=SPEAKER_TITLE,
        company_title=COMPANY_TITLE,
    )


if __name__ == "__main__":
    main()
