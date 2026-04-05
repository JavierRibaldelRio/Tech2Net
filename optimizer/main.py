import argparse

from input import load_matrix
from optimizer import optimize
from pdf_report import generate_pdf


def main():

    parser = argparse.ArgumentParser(description="Tech2Net scheduler")
    parser.add_argument("csv_file", help="Path to the input CSV file")
    # Columns are 1-based.
    # Columns 1..2 are used to build the company/person identifier (origin + persona).
    # The remaining columns are speaker availability columns.
    parser.add_argument(
        "--company-cols",
        nargs="+",
        type=int,
        default=[1, 2],
        metavar="COL",
        help="1-based column indices for company identifier (default: 1 2)",
    )
    parser.add_argument(
        "--speaker-cols",
        nargs="+",
        type=int,
        default=list(range(3, 11)),
        metavar="COL",
        help="1-based column indices for speaker availability (default: 3..10)",
    )
    parser.add_argument(
        "--time-slots",
        nargs="+",
        default=["13:20–13:30", "13:30–13:40", "13:40–13:50", "13:50–14:00", "14:00–14:10"],
        metavar="SLOT",
        help='Time slot labels (default: 5 slots from 10:00)',
    )
    parser.add_argument(
        "--output",
        default="agenda.pdf",
        help="Path for the generated PDF (default: agenda.pdf)",
    )
    args = parser.parse_args()

    data = load_matrix(
        args.csv_file,
        company_col_indices=args.company_cols,
        speaker_col_indices=args.speaker_cols,
        shuffle_companies=True,
        shuffle_speakers=True,
        seed=42,
    )
    schedule, stats = optimize(data, len(args.time_slots))

    print("Reuniones:", stats["meetings"])
    print("Speakers cubiertos:", stats["speakers_covered"])
    print("Empresas cubiertas:", stats["companies_covered"])
    print("Optimal:", stats["optimal"])

    generate_pdf(
        schedule,
        stats,
        args.time_slots,
        args.output,
        time_title="Hora",
        speaker_title="Ponente",
        company_title="Asistente",
    )


if __name__ == "__main__":
    main()
