import pandas as pd
from weasyprint import HTML


def generate_pdf(schedule, stats, time_slots, output_file):

    df = pd.DataFrame(schedule)

    # Convert slot index to time label
    df["time"] = df["slot"].apply(lambda s: time_slots[s - 1])

    sections = []

    # -------- GENERAL --------
    sections.append(f"""
    <div>
        <h1>General Results</h1>
        <p>Total meetings: <b>{stats['meetings']}</b></p>
        <p>Optimal solution: <b>{stats['optimal']}</b></p>
    </div>
    """)

    # -------- GLOBAL --------
    global_table = (
        df[["time", "speaker", "company"]]
        .sort_values(["time", "speaker"])
        .to_html(index=False)
    )

    sections.append(f"""
    <div class="page">
        <h1>Global Schedule</h1>
        {global_table}
    </div>
    """)

    # -------- PER COMPANY --------
    for c in sorted(df["company"].unique()):
        sub = df[df["company"] == c].sort_values("time")
        table = sub[["time", "speaker"]].to_html(index=False)

        sections.append(f"""
        <div class="page">
            <h1>Company: {c}</h1>
            {table}
        </div>
        """)

    # -------- PER SPEAKER --------
    for s in sorted(df["speaker"].unique()):
        sub = df[df["speaker"] == s].sort_values("time")
        table = sub[["time", "company"]].to_html(index=False)

        sections.append(f"""
        <div class="page">
            <h1>Speaker: {s}</h1>
            {table}
        </div>
        """)

    
    # -------- SLOT x SPEAKER MATRIX --------

    # Crear tabla base
    matrix_df = df.copy()

    # Pivot: filas = time, columnas = speaker
    pivot = matrix_df.pivot_table(
        index="time",
        columns="speaker",
        values="company",
        aggfunc="first"
    )

    # Ordenar por tiempo según time_slots
    pivot = pivot.reindex(time_slots)

    pivot_html = pivot.fillna("").to_html()

    sections.append(f"""
    <div class="page general">
        <h1>Schedule Matrix (Time × Speaker)</h1>
        {pivot_html}
    </div>
    """)    

    html = f"""
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial; }}

            h1 {{
                border-bottom: 2px solid black;
            }}

            table {{
                border-collapse: collapse;
                width: 100%;
                margin-top: 15px;

            }}

            th, td {{
                border: 1px solid #444;
                padding: 6px;
                text-align: center;


            }}

            .general td,
            .general th {{

                  font-size: 10px;

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


    HTML(string=html).write_pdf(output_file)

    print("PDF generated:", output_file)