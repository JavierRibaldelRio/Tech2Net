from ortools.sat.python import cp_model


def optimize(data, N):

    companies = data["companies"]
    speakers = data["speakers"]
    matrix = data["matrix"]

    model = cp_model.CpModel()

    x = {}

    # Meeting variables
    for s in speakers:
        for c in matrix.get(s, []):
            for t in range(N):
                x[(s, c, t)] = model.NewBoolVar(f"x_{s}_{c}_{t}")

    # -------- Constraints --------

    # One speaker per slot
    for s in speakers:
        for t in range(N):
            vars_t = [x[(ss, c, tt)]
                      for (ss, c, tt) in x
                      if ss == s and tt == t]
            if vars_t:
                model.Add(sum(vars_t) <= 1)

    # One company per slot
    for c in companies:
        for t in range(N):
            vars_t = [x[(s, cc, tt)]
                      for (s, cc, tt) in x
                      if cc == c and tt == t]
            if vars_t:
                model.Add(sum(vars_t) <= 1)

    # Each pair only once
    for s in speakers:
        for c in matrix.get(s, []):
            vars_pair = [x[(s, c, t)] for t in range(N) if (s, c, t) in x]
            if vars_pair:
                model.Add(sum(vars_pair) <= 1)

    # -------- Coverage variables --------

    # Speakers
    y = {}
    for s in speakers:
        y[s] = model.NewBoolVar(f"covered_s_{s}")
        meetings_s = [x[(ss, c, t)]
                      for (ss, c, t) in x if ss == s]

        if meetings_s:
            model.Add(sum(meetings_s) >= y[s])
        else:
            model.Add(y[s] == 0)

    # Companies
    z = {}
    for c in companies:
        z[c] = model.NewBoolVar(f"covered_c_{c}")
        meetings_c = [x[(s, cc, t)]
                      for (s, cc, t) in x if cc == c]

        if meetings_c:
            model.Add(sum(meetings_c) >= z[c])
        else:
            model.Add(z[c] == 0)

    # -------- Objective --------

    BIG1 = 1_000_000  # Speakers coverage
    BIG2 = 100_000      # Companies coverage

    model.Maximize(
        BIG1 * sum(y.values()) +
        BIG2 * sum(z.values()) +
        sum(x.values())
    )

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 45

    status = solver.Solve(model)

    schedule = []

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for (s, c, t), var in x.items():
            if solver.Value(var):
                schedule.append({
                    "slot": t + 1,
                    "speaker": s,
                    "company": c
                })

    stats = {
        "meetings": len(schedule),
        "speakers_covered": sum(solver.Value(y[s]) for s in speakers),
        "companies_covered": sum(solver.Value(z[c]) for c in companies),
        "optimal": status == cp_model.OPTIMAL,
        "status": solver.StatusName(status)
    }

    return schedule, stats