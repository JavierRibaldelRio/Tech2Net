import os

import pandas as pd
from xhtml2pdf import pisa


def generate_pdf(
    schedule,
    stats,
    time_slots,
    output_file,
    *,
    time_title="time",
    speaker_title="speaker",
    company_title="company",
):

    df = pd.DataFrame(schedule)

    # Convert slot index to time label
    df["time"] = df["slot"].apply(lambda s: time_slots[s - 1])

    # Display names for columns (customizable)
    display_df = df.rename(
        columns={"time": time_title, "speaker": speaker_title, "company": company_title}
    )

    sections = []

    # -------- GENERAL --------
    sections.append(
        f"""
    <div>
        <h1>General Results</h1>
        <p>Total meetings: <b>{stats['meetings']}</b></p>
        <p>Optimal solution: <b>{stats['optimal']}</b></p>
    </div>
    """
    )

    # -------- GLOBAL --------
    global_table = (
        display_df[[time_title, speaker_title, company_title]]
        .sort_values([time_title, speaker_title])
        .to_html(index=False)
    )

    sections.append(
        f"""
    <div class="page">
        <h1>Global Schedule</h1>
        {global_table}
    </div>
    """
    )

    # -------- PER COMPANY --------
    for c in sorted(display_df[company_title].unique()):
        sub = display_df[display_df[company_title] == c].sort_values(time_title)
        table = sub[[time_title, speaker_title]].to_html(index=False)

        sections.append(
            f"""
        <div class="page">
            <h1>{company_title}: {c}</h1>
            {table}
        </div>
        """
        )

    # -------- PER SPEAKER --------
    for s in sorted(display_df[speaker_title].unique()):
        sub = display_df[display_df[speaker_title] == s].sort_values(time_title)
        table = sub[[time_title, company_title]].to_html(index=False)

        sections.append(
            f"""
        <div class="page">
            <h1>{speaker_title}: {s}</h1>
            {table}
        </div>
        """
        )

    # -------- SLOT x SPEAKER MATRIX (XLSX) --------

    pivot = display_df.pivot_table(
        index=time_title, columns=speaker_title, values=company_title, aggfunc="first"
    ).reindex(time_slots)

    xlsx_path = os.path.splitext(output_file)[0] + "_matrix.xlsx"
    pivot.fillna("").to_excel(xlsx_path)

    html = f"""
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @page {{ size: A4 portrait; margin: 1.5cm; }}

            body {{ font-family: Arial; font-size: 11px; }}

            h1 {{
                border-bottom: 2px solid black;
                text-transform: capitalize;
            }}

            table {{
                border-collapse: collapse;
                width: 100%;
                margin-top: 15px;
            }}

            th, td {{
                border: 1px solid #444;
                padding: 4px 6px;
                text-align: center;
            }}

            .page {{
                page-break-before: always;
            }}
        </style>
    </head>
    <body>
        {''.join(sections)}
    </body>
    </html>
    """

    with open(output_file, "wb") as f:
        pisa.CreatePDF(html, dest=f)

    print("PDF generated:", output_file)
    print("Matrix XLSX generated:", xlsx_path)
