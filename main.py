from input import load_matrix
from optimizer import optimize
from pdf_report import generate_pdf

INPUT_FILE = "balanced.csv"
TIME_SLOTS = [
    "10:00–10:15",
    "10:20–10:35",
    "10:40–10:55",
    "11:00–11:15",
    "11:20–11:35"
]
def main():

    data = load_matrix(
        INPUT_FILE,
        shuffle_companies=True,
        shuffle_speakers=False,
        seed=42
    )
    schedule, stats = optimize(data, len(TIME_SLOTS))

    print("Reuniones:", stats["meetings"])
    print("speakers cubiertos:", stats["speakers_covered"])
    print("Empresas cubiertas:", stats["companies_covered"])
    print("Optimal:", stats["optimal"])

    generate_pdf(schedule, stats, TIME_SLOTS, "agenda.pdf")


if __name__ == "__main__":
    main()