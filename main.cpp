#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <algorithm>
#include <chrono>
#include <random>
#include <map>
#include <set>
#include <cctype>
#include <cstdlib>
#include <hpdf.h>
#include <limits>
#include <climits>

using namespace std;

// ========================
// Estructuras de Datos
// ========================
struct Asistente
{
    string id;               // Correo (usado internamente para asignación)
    string name;             // Nombre y apellidos
    string company;          // Empresa
    vector<string> requests; // Ej.: {"E1", "E3", ...}
};

struct Ponente
{
    string id; // Ej.: "E1", "E2", ...
};

struct Assignment
{
    string asistente; // Correo del asistente asignado
    string ponente;   // ID del ponente asignado
    int slot;         // Índice 0..5 (corresponde a los intervalos de tiempo)

    // Nuevos campos para guardar datos completos del asistente
    string asistenteName;    // Nombre y apellidos
    string asistenteCompany; // Empresa
};

// ========================
// Prototipos de Funciones
// ========================
vector<string> split(const string &s, char delimiter);
string trim(const string &s);
string toUpper(const string &s);
vector<Asistente> parseCSV(const string &filename);

vector<Assignment> singleGreedySchedule(
    const vector<Asistente> &asistentes,
    const vector<Ponente> &ponentes,
    const vector<int> &slotIndices,
    const vector<int> &order);

vector<Assignment> multiGreedySchedule(
    vector<Asistente> asistentes,
    const vector<Ponente> &ponentes,
    const vector<int> &slotIndices,
    int maxSeconds);

void printSchedule(const vector<Assignment> &schedule, const vector<string> &timeLabels);

string formatAttendee(const vector<Asistente> &asistentes, const string &email);

vector<vector<string>> buildPivotPonentes(
    const vector<Assignment> &assignments,
    const vector<string> &timeLabels,
    const vector<Ponente> &ponentes,
    const vector<Asistente> &asistentes);

vector<vector<string>> buildPivotAsistentes(
    const vector<Assignment> &assignments,
    const vector<string> &timeLabels,
    const vector<Asistente> &asistentes);

void drawPivotTable(HPDF_Doc pdf,
                    const vector<vector<string>> &pivot,
                    const string &title,
                    int startX,
                    int startY,
                    int cellWidth,
                    int cellHeight,
                    int bottomMargin,
                    float headerFontSize,
                    float contentFontSize);

void createPageForAsistente(HPDF_Doc pdf,
                            const Asistente &asist,
                            const vector<Assignment> &allAssignments,
                            const vector<string> &timeLabels,
                            const string &tituloConstante);

void createPageForPonente(HPDF_Doc pdf,
                          const Ponente &pon,
                          const vector<Assignment> &allAssignments,
                          const vector<string> &timeLabels,
                          const vector<Asistente> &asistentes,
                          const string &tituloConstante);

void generatePDF(const vector<Assignment> &assignments,
                 const vector<string> &timeLabels,
                 const vector<Ponente> &ponentes,
                 const vector<Asistente> &asistentes,
                 const string &tituloConstante);

// ========================
// Implementación de Funciones
// ========================
vector<string> split(const string &s, char delimiter)
{
    vector<string> tokens;
    istringstream tokenStream(s);
    string token;
    while (getline(tokenStream, token, delimiter))
        tokens.push_back(token);
    return tokens;
}

string trim(const string &s)
{
    size_t start = s.find_first_not_of(" \t\r\n");
    size_t end = s.find_last_not_of(" \t\r\n");
    if (start == string::npos)
        return "";
    return s.substr(start, end - start + 1);
}

string toUpper(const string &s)
{
    string result = s;
    transform(result.begin(), result.end(), result.begin(),
              [](unsigned char c)
              { return toupper(c); });
    return result;
}

// parseCSV: Lee el CSV con columnas: email, nombre y apellidos, empresa, E1, E2, ...
vector<Asistente> parseCSV(const string &filename)
{
    vector<Asistente> asistentes;
    ifstream file(filename);
    if (!file.is_open())
    {
        cerr << "No se pudo abrir el archivo: " << filename << endl;
        return asistentes;
    }
    string line;
    bool firstLine = true;
    vector<string> headers;
    while (getline(file, line))
    {
        if (line.empty())
            continue;
        if (firstLine)
        {
            headers = split(line, ',');
            firstLine = false;
            continue;
        }
        vector<string> row = split(line, ',');
        if (row.empty())
            continue;
        Asistente a;
        a.id = trim(row[0]); // correo
        if (row.size() > 1)
            a.name = trim(row[1]); // nombre y apellidos
        if (row.size() > 2)
            a.company = trim(row[2]); // empresa
        for (size_t i = 3; i < headers.size() && i < row.size(); i++)
        {
            string cell = trim(row[i]);
            if (!cell.empty() /* && toUpper(cell) == "E"*/)
                a.requests.push_back(headers[i]);
        }
        asistentes.push_back(a);
    }
    file.close();
    return asistentes;
}

vector<Assignment> singleGreedySchedule(
    const vector<Asistente> &asistentes,
    const vector<Ponente> &ponentes,
    const vector<int> &slotIndices,
    const vector<int> &order)
{
    vector<Assignment> schedule;
    // Contador de reuniones para cada asistente (usamos el índice de 'asistentes')
    vector<int> meetingCount(asistentes.size(), 0);
    map<string, set<string>> assignedPairs;
    for (size_t i = 0; i < asistentes.size(); i++)
        assignedPairs[asistentes[i].id] = set<string>();

    vector<set<string>> busyAsist(slotIndices.size());
    vector<set<string>> busyPon(slotIndices.size());

    // En cada slot, en lugar de seguir el orden "order" directamente, ordenamos según meetingCount.
    for (size_t t = 0; t < slotIndices.size(); t++)
    {
        int slot = slotIndices[t];
        // Crear un vector de índices de asistentes
        vector<int> indices = order;
        // Ordenar índices en función del número de reuniones asignadas (de menor a mayor)
        sort(indices.begin(), indices.end(), [&meetingCount](int i1, int i2)
             { return meetingCount[i1] < meetingCount[i2]; });

        for (auto idx : indices)
        {
            if (idx >= (int)asistentes.size())
                continue;
            const auto &a = asistentes[idx];
            if (busyAsist[t].count(a.id))
                continue;
            // Intentar asignar una reunión al asistente "a" si solicita algún ponente disponible
            for (const auto &req : a.requests)
            {
                auto it = find_if(ponentes.begin(), ponentes.end(),
                                  [&](const Ponente &p)
                                  { return toUpper(p.id) == toUpper(req); });
                if (it == ponentes.end())
                    continue;
                string pID = it->id;
                if (busyPon[t].count(pID))
                    continue;
                if (assignedPairs[a.id].count(pID))
                    continue;
                schedule.push_back({a.id, pID, slot, a.name, a.company});
                busyAsist[t].insert(a.id);
                busyPon[t].insert(pID);
                assignedPairs[a.id].insert(pID);
                meetingCount[idx]++; // Incrementa el contador para este asistente
                break;
            }
        }
    }
    return schedule;
}

vector<Assignment> singleGreedyScheduleWithPreassigned(
    const vector<Asistente> &asistentes,
    const vector<Ponente> &ponentes,
    const vector<int> &slotIndices,
    const vector<int> &order,
    const vector<Assignment> &preassigned)
{
    // Inicia con las citas prefijadas
    vector<Assignment> schedule = preassigned;

    // Inicializar el mapa para evitar asignar la misma combinación asistente–ponente
    map<string, set<string>> assignedPairs;
    for (size_t i = 0; i < asistentes.size(); i++)
    {
        assignedPairs[asistentes[i].id] = set<string>();
    }

    // Inicializar estructuras para marcar los slots ocupados por asistente y ponente
    vector<set<string>> busyAsist(slotIndices.size());
    vector<set<string>> busyPon(slotIndices.size());

    // Marcar las preasignaciones en las estructuras de control
    for (const auto &pref : preassigned)
    {
        int slot = pref.slot;
        busyAsist[slot].insert(pref.asistente);
        busyPon[slot].insert(pref.ponente);
        assignedPairs[pref.asistente].insert(pref.ponente);
    }

    // Para cada slot, se asignan reuniones adicionales respetando las preasignadas
    for (size_t t = 0; t < slotIndices.size(); t++)
    {
        int slot = slotIndices[t];
        // Copia del vector "order" y ordenar asistentes según la cantidad de reuniones asignadas
        vector<int> indices = order;
        sort(indices.begin(), indices.end(), [&assignedPairs, &asistentes](int i1, int i2)
             { return assignedPairs[asistentes[i1].id].size() < assignedPairs[asistentes[i2].id].size(); });

        for (auto idx : indices)
        {
            if (idx >= (int)asistentes.size())
                continue;
            const auto &a = asistentes[idx];
            if (busyAsist[slot].count(a.id))
                continue;
            // Recorrer las solicitudes del asistente
            for (const auto &req : a.requests)
            {
                auto it = find_if(ponentes.begin(), ponentes.end(),
                                  [&](const Ponente &p)
                                  { return toUpper(p.id) == toUpper(req); });
                if (it == ponentes.end())
                    continue;
                string pID = it->id;
                if (busyPon[slot].count(pID))
                    continue;
                if (assignedPairs[a.id].count(pID))
                    continue;
                // Asignar la reunión
                schedule.push_back({a.id, pID, slot, a.name, a.company});
                busyAsist[slot].insert(a.id);
                busyPon[slot].insert(pID);
                assignedPairs[a.id].insert(pID);
                break; // Una asignación por asistente por slot
            }
        }
    }
    return schedule;
}

vector<Assignment> multiGreedySchedule(
    vector<Asistente> asistentes,
    const vector<Ponente> &ponentes,
    const vector<int> &slotIndices,
    int maxSeconds)
{
    vector<Assignment> bestSchedule;
    size_t bestSize = 0;
    int tries = 0;
    auto startTime = chrono::steady_clock::now();

    vector<int> indices(asistentes.size());
    for (int i = 0; i < (int)asistentes.size(); i++)
        indices[i] = i;
    mt19937 rng(random_device{}());

    while (true)
    {
        auto now = chrono::steady_clock::now();
        auto elapsed = chrono::duration_cast<chrono::seconds>(now - startTime).count();
        if (elapsed >= maxSeconds)
        {
            cout << "Tiempo límite de " << maxSeconds << " segundos alcanzado.\n";
            break;
        }
        tries++;
        shuffle(indices.begin(), indices.end(), rng);
        auto schedule = singleGreedySchedule(asistentes, ponentes, slotIndices, indices);
        if (schedule.size() > bestSize)
        {
            bestSize = schedule.size();
            bestSchedule = schedule;
        }
    }
    cout << "Número de configuraciones probadas: " << tries << "\n";
    return bestSchedule;
}

vector<Assignment> multiGreedyScheduleWithPreassigned(
    vector<Asistente> asistentes,
    const vector<Ponente> &ponentes,
    const vector<int> &slotIndices,
    int maxSeconds,
    const vector<Assignment> &preassigned)
{
    // Inicia con las citas preasignadas
    vector<Assignment> schedule = preassigned;

    // Contador de reuniones asignadas (inicialmente 0, se actualiza con las preasignaciones)
    map<string, int> meetingCount;
    for (const auto &a : asistentes)
        meetingCount[a.id] = 0;
    for (const auto &pref : preassigned)
        meetingCount[pref.asistente]++;

    // Para evitar asignar la misma combinación asistente–ponente
    map<string, set<string>> assignedPairs;
    for (const auto &a : asistentes)
        assignedPairs[a.id] = set<string>();
    for (const auto &pref : preassigned)
        assignedPairs[pref.asistente].insert(pref.ponente);

    // Estructuras para marcar huecos ocupados
    vector<set<string>> busyAsist(slotIndices.size());
    vector<set<string>> busyPon(slotIndices.size());
    for (const auto &pref : preassigned)
    {
        int slot = pref.slot;
        busyAsist[slot].insert(pref.asistente);
        busyPon[slot].insert(pref.ponente);
    }

    // Orden natural de asistentes (por índice)
    vector<int> order(asistentes.size());
    for (int i = 0; i < (int)asistentes.size(); i++)
        order[i] = i;

    auto startTimeInner = chrono::steady_clock::now();
    int tries = 0;
    mt19937 rng(random_device{}());

    while (true)
    {
        auto now = chrono::steady_clock::now();
        auto elapsed = chrono::duration_cast<chrono::seconds>(now - startTimeInner).count();
        if (elapsed >= maxSeconds)
        {
            cout << "Tiempo límite de " << maxSeconds << " segundos alcanzado.\n";
            break;
        }
        tries++;
        // Barajar el orden para explorar configuraciones distintas
        shuffle(order.begin(), order.end(), rng);

        // Para cada slot disponible
        for (size_t t = 0; t < slotIndices.size(); t++)
        {
            int slot = slotIndices[t];

            // Recoger asistentes disponibles para este slot
            vector<int> available;
            for (int idx : order)
            {
                const auto &a = asistentes[idx];
                if (!busyAsist[slot].count(a.id))
                    available.push_back(idx);
            }
            if (available.empty())
                continue;

            // Determinar el mínimo número de reuniones entre los asistentes disponibles
            int minCount = INT_MAX;
            for (int idx : available)
            {
                minCount = min(minCount, meetingCount[asistentes[idx].id]);
            }
            // Para cada asistente disponible que tiene el mínimo, se intenta asignar
            for (int idx : available)
            {
                if (meetingCount[asistentes[idx].id] != minCount)
                    continue; // Solo asignamos a los que tienen la menor cantidad
                const auto &a = asistentes[idx];
                // Intentar asignar la primera solicitud que esté disponible
                for (const auto &req : a.requests)
                {
                    auto it = find_if(ponentes.begin(), ponentes.end(),
                                      [&](const Ponente &p)
                                      { return toUpper(p.id) == toUpper(req); });
                    if (it == ponentes.end())
                        continue;
                    string pID = it->id;
                    if (busyPon[slot].count(pID))
                        continue;
                    if (assignedPairs[a.id].count(pID))
                        continue;
                    // Asignar la cita
                    schedule.push_back({a.id, pID, slot, a.name, a.company});
                    busyAsist[slot].insert(a.id);
                    busyPon[slot].insert(pID);
                    assignedPairs[a.id].insert(pID);
                    meetingCount[a.id]++;
                    break; // Una asignación por asistente en este slot
                }
            }
        }
    }
    cout << "Número de configuraciones probadas: " << tries << "\n";
    return schedule;
}

vector<Assignment> multiGreedyScheduleAuto(
    vector<Asistente> asistentes,
    const vector<Ponente> &ponentes,
    const vector<int> &slotIndices,
    int maxSeconds,
    const vector<Assignment> &preassigned)
{
    if (preassigned.empty())
    {
        // Si no hay preasignaciones, usamos la función original
        return multiGreedySchedule(asistentes, ponentes, slotIndices, maxSeconds);
    }
    else
    {
        // Si hay preasignaciones, usamos la versión que las respeta
        return multiGreedyScheduleWithPreassigned(asistentes, ponentes, slotIndices, maxSeconds, preassigned);
    }
}

void printSchedule(const vector<Assignment> &schedule, const vector<string> &timeLabels)
{
    cout << "\n=== Horario de Reuniones ===\n";
    for (auto &asg : schedule)
        cout << timeLabels[asg.slot] << ": " << asg.asistente << " con " << asg.ponente << "\n";
}

// formatAttendee: Dado un correo, devuelve "Nombre y Apellidos (Empresa)"
string formatAttendee(const vector<Asistente> &asistentes, const string &email)
{
    for (auto &a : asistentes)
    {
        if (a.id == email)
            return a.name + " (" + a.company + ")";
    }
    return email;
}

// buildPivotPonentes: Construye la tabla para ponentes (filas = ponentes, columnas = intervalos)
// Cada celda muestra el asistente formateado ("Nombre y Apellidos (Empresa)")
vector<vector<string>> buildPivotPonentes(
    const vector<Assignment> &assignments,
    const vector<string> &timeLabels,
    const vector<Ponente> &ponentes,
    const vector<Asistente> &asistentes)
{
    vector<vector<string>> pivot;
    vector<string> header;
    header.push_back("Ponente");
    for (const auto &label : timeLabels)
        header.push_back(label);
    pivot.push_back(header);

    for (auto &p : ponentes)
    {
        vector<string> row;
        row.push_back(p.id);
        for (size_t i = 0; i < timeLabels.size(); i++)
        {
            string cell = "---";
            for (auto &asg : assignments)
            {
                if (asg.ponente == p.id && asg.slot == (int)i)
                {
                    cell = formatAttendee(asistentes, asg.asistente);
                    break;
                }
            }
            row.push_back(cell);
        }
        pivot.push_back(row);
    }
    return pivot;
}

// buildPivotAsistentes: Construye la tabla para asistentes (filas = asistentes, columnas = intervalos)
// La primera columna muestra "Nombre y Apellidos (Empresa)" y el resto el ponente asignado.
vector<vector<string>> buildPivotAsistentes(
    const vector<Assignment> &assignments,
    const vector<string> &timeLabels,
    const vector<Asistente> &asistentes)
{
    vector<vector<string>> pivot;
    vector<string> header;
    header.push_back("Asistente");
    for (const auto &label : timeLabels)
        header.push_back(label);
    pivot.push_back(header);

    for (auto &a : asistentes)
    {
        vector<string> row;
        row.push_back(a.name + " (" + a.company + ")");
        for (size_t i = 0; i < timeLabels.size(); i++)
        {
            string cell = "---";
            for (auto &asg : assignments)
            {
                if (asg.asistente == a.id && asg.slot == (int)i)
                {
                    cell = asg.ponente;
                    break;
                }
            }
            row.push_back(cell);
        }
        pivot.push_back(row);
    }
    return pivot;
}

// Función para construir la tabla pivot "E (Ponente) vs Turno" en la que cada celda muestra la empresa del asistente asignado.
vector<vector<string>> buildPivotEmpresasPonentes(
    const vector<Assignment> &assignments,
    const vector<string> &timeLabels,
    const vector<Ponente> &ponentes,
    const vector<Asistente> &asistentes)
{
    vector<vector<string>> pivot;
    // Cabecera: Primera columna es "E" y luego cada turno.
    vector<string> header;
    header.push_back("E");
    for (const auto &label : timeLabels)
        header.push_back(label);
    pivot.push_back(header);

    // Para cada ponente (cada "E")
    for (const auto &p : ponentes)
    {
        vector<string> row;
        row.push_back(p.id);
        // Para cada turno, buscamos si hay asignación para ese ponente.
        for (size_t i = 0; i < timeLabels.size(); i++)
        {
            string cell = "---";
            // Buscar en las asignaciones una que cumpla: ponente = p.id y slot == i.
            for (const auto &asg : assignments)
            {
                if (asg.ponente == p.id && asg.slot == (int)i)
                {
                    // Buscar la empresa del asistente
                    for (const auto &a : asistentes)
                    {
                        if (a.id == asg.asistente)
                        {
                            cell = a.name + " (" + a.company + ")";
                            break;
                        }
                    }
                    break;
                }
            }
            row.push_back(cell);
        }
        pivot.push_back(row);
    }
    return pivot;
}

// ========================
// Función para escribir CSV a partir de una tabla pivot
// ========================
void writeCSV(const vector<vector<string>> &table, const string &filename)
{
    ofstream outFile(filename);
    if (!outFile.is_open())
    {
        cerr << "Error al abrir " << filename << " para escribir." << endl;
        return;
    }

    for (const auto &row : table)
    {
        bool first = true;
        for (const auto &cell : row)
        {
            if (!first)
                outFile << ",";
            outFile << "\"" << cell << "\"";
            first = false;
        }
        outFile << "\n";
    }
    outFile.close();
    cout << "CSV generado: " << filename << endl;
}

// ========================
// Función para generar los CSV (para ponentes y asistentes)
// ========================
void generateCSVs(const vector<Assignment> &assignments,
                  const vector<string> &timeLabels,
                  const vector<Ponente> &ponentes,
                  const vector<Asistente> &asistentes)
{
    vector<vector<string>> pivotPonentes = buildPivotPonentes(assignments, timeLabels, ponentes, asistentes);
    vector<vector<string>> pivotAsistentes = buildPivotAsistentes(assignments, timeLabels, asistentes);
    vector<vector<string>> pivot = buildPivotEmpresasPonentes(assignments, timeLabels, ponentes, asistentes);

    writeCSV(pivotPonentes, "reuniones_por_ponente.csv");
    writeCSV(pivotAsistentes, "reuniones_por_asistente.csv");
    writeCSV(pivot, "reuniones_por_ponente_empresa.csv");
}

// ========================
// Generación de PDF
// ========================
void createPonentePage(HPDF_Doc pdf,
                       const string &ponenteId,
                       const vector<Assignment> &assignments,
                       const vector<Asistente> &asistentes,
                       const vector<string> &timeLabels,
                       const string &titulo)
{

    HPDF_Page page = HPDF_AddPage(pdf);
    HPDF_Page_SetSize(page, HPDF_PAGE_SIZE_A4, HPDF_PAGE_PORTRAIT);

    // Configurar fuente
    HPDF_Font font = HPDF_GetFont(pdf, "Helvetica", NULL);
    if (!font)
    {
        cerr << "Error al cargar la fuente Helvetica" << endl;
        return;
    }

    // Título de la página
    HPDF_Page_BeginText(page);
    HPDF_Page_SetFontAndSize(page, font, 16);
    HPDF_Page_TextOut(page, 50, 800, titulo.c_str());
    HPDF_Page_EndText(page);

    // Encabezado del ponente
    HPDF_Page_BeginText(page);
    HPDF_Page_SetFontAndSize(page, font, 14);
    string header = "Empresa Ponente: " + ponenteId;
    HPDF_Page_TextOut(page, 50, 770, header.c_str());
    HPDF_Page_EndText(page);

    // Filtrar asignaciones para este ponente
    vector<Assignment> ponenteAssignments;
    for (const auto &asg : assignments)
    {
        if (asg.ponente == ponenteId)
        {
            ponenteAssignments.push_back(asg);
        }
    }

    // Ordenar por slot de tiempo
    sort(ponenteAssignments.begin(), ponenteAssignments.end(),
         [](const Assignment &a, const Assignment &b)
         {
             return a.slot < b.slot;
         });

    // Configurar tabla
    int startX = 30;
    int startY = 730;
    int cellHeight = 20;
    int row = 0;

    // Encabezados de la tabla (ajustados para nueva columna)
    HPDF_Page_BeginText(page);
    HPDF_Page_SetFontAndSize(page, font, 12);
    HPDF_Page_TextOut(page, startX, startY, "Horario");
    HPDF_Page_TextOut(page, startX + 100, startY, "Asistente");
    HPDF_Page_TextOut(page, startX + 250, startY, "Empresa");
    HPDF_Page_TextOut(page, startX + 400, startY, "Email");
    HPDF_Page_EndText(page);

    startY -= 30;

    // Línea separadora
    HPDF_Page_SetLineWidth(page, 1.0);
    HPDF_Page_MoveTo(page, startX, startY + 10);
    HPDF_Page_LineTo(page, startX + 530, startY + 10);
    // Aumentamos el ancho para la nueva columna
    HPDF_Page_Stroke(page);

    // Contenido de la tabla
    for (const auto &asg : ponenteAssignments)
    {
        // Buscar información del asistente
        string asistenteName, asistenteCompany, asistenteEmail;
        for (const auto &a : asistentes)
        {
            if (a.id == asg.asistente)
            {
                asistenteName = a.name;
                asistenteCompany = a.company;
                asistenteEmail = a.id; // El email está en el campo id
                break;
            }
        }

        // Mostrar información
        HPDF_Page_BeginText(page);
        HPDF_Page_SetFontAndSize(page, font, 10);

        // Horario
        string horario = (asg.slot < timeLabels.size()) ? timeLabels[asg.slot] : "";
        HPDF_Page_TextOut(page, startX, startY - row * cellHeight, horario.c_str());

        // Nombre asistente
        HPDF_Page_TextOut(page, startX + 100, startY - row * cellHeight, asistenteName.c_str());

        // Empresa asistente
        HPDF_Page_TextOut(page, startX + 250, startY - row * cellHeight, asistenteCompany.c_str());

        // Email asistente
        HPDF_Page_TextOut(page, startX + 400, startY - row * cellHeight, asistenteEmail.c_str());

        HPDF_Page_EndText(page);

        row++;

        // Nueva página si nos quedamos sin espacio
        if (startY - row * cellHeight < 50)
        {
            page = HPDF_AddPage(pdf);
            HPDF_Page_SetSize(page, HPDF_PAGE_SIZE_A4, HPDF_PAGE_PORTRAIT);
            startY = 750;
            row = 0;

            // Repetir encabezado en nueva página
            HPDF_Page_BeginText(page);
            HPDF_Page_SetFontAndSize(page, font, 16);
            HPDF_Page_TextOut(page, 50, 800, titulo.c_str());
            HPDF_Page_EndText(page);

            HPDF_Page_BeginText(page);
            HPDF_Page_SetFontAndSize(page, font, 14);
            HPDF_Page_TextOut(page, 50, 770, header.c_str());
            HPDF_Page_EndText(page);

            HPDF_Page_BeginText(page);
            HPDF_Page_SetFontAndSize(page, font, 12);
            HPDF_Page_TextOut(page, startX, startY, "Horario");
            HPDF_Page_TextOut(page, startX + 120, startY, "Asistente");
            HPDF_Page_TextOut(page, startX + 270, startY, "Empresa");
            HPDF_Page_TextOut(page, startX + 420, startY, "Email");
            HPDF_Page_EndText(page);

            startY -= 30;
        }
    }
}

// ========================
// Función para crear página de asistente
// ========================
void createAsistentePage(HPDF_Doc pdf,
                         const Asistente &asistente,
                         const vector<Assignment> &assignments,
                         const vector<string> &timeLabels,
                         const string &titulo)
{

    HPDF_Page page = HPDF_AddPage(pdf);
    HPDF_Page_SetSize(page, HPDF_PAGE_SIZE_A4, HPDF_PAGE_PORTRAIT);

    // Configurar fuente
    HPDF_Font font = HPDF_GetFont(pdf, "Helvetica", NULL);
    if (!font)
    {
        cerr << "Error al cargar la fuente Helvetica" << endl;
        return;
    }

    // Título de la página
    HPDF_Page_BeginText(page);
    HPDF_Page_SetFontAndSize(page, font, 16);
    HPDF_Page_TextOut(page, 50, 800, titulo.c_str());
    HPDF_Page_EndText(page);

    // Encabezado del asistente
    HPDF_Page_BeginText(page);
    HPDF_Page_SetFontAndSize(page, font, 14);
    string header = "Asistente: " + asistente.name + " (" + asistente.company + ")";
    HPDF_Page_TextOut(page, 50, 770, header.c_str());
    HPDF_Page_EndText(page);

    // Configurar tabla
    int startX = 50;
    int startY = 730;
    int cellHeight = 20;
    int row = 0;

    // Encabezados de la tabla
    HPDF_Page_BeginText(page);
    HPDF_Page_SetFontAndSize(page, font, 12);
    HPDF_Page_TextOut(page, startX, startY, "Franja Horaria");
    HPDF_Page_TextOut(page, startX + 150, startY, "Empresa Ponente");
    HPDF_Page_EndText(page);

    startY -= 30;

    // Línea separadora
    HPDF_Page_SetLineWidth(page, 1.0);
    HPDF_Page_MoveTo(page, startX, startY + 10);
    HPDF_Page_LineTo(page, startX + 300, startY + 10);
    HPDF_Page_Stroke(page);

    // Crear mapa de asignaciones por slot para este asistente
    map<int, string> asignacionesPorSlot;
    for (const auto &asg : assignments)
    {
        if (asg.asistente == asistente.id)
        {
            asignacionesPorSlot[asg.slot] = asg.ponente;
        }
    }

    // Mostrar todas las franjas horarias
    for (size_t i = 0; i < timeLabels.size(); i++)
    {
        string ponente = "-"; // Guión por defecto (no hay reunión)
        if (asignacionesPorSlot.find(i) != asignacionesPorSlot.end())
        {
            ponente = asignacionesPorSlot[i];
        }

        // Mostrar información
        HPDF_Page_BeginText(page);
        HPDF_Page_SetFontAndSize(page, font, 10);

        // Franja horaria
        HPDF_Page_TextOut(page, startX, startY - row * cellHeight, timeLabels[i].c_str());

        // Empresa ponente
        HPDF_Page_TextOut(page, startX + 150, startY - row * cellHeight, ponente.c_str());

        HPDF_Page_EndText(page);

        row++;

        // Nueva página si nos quedamos sin espacio
        if (startY - row * cellHeight < 50 && i < timeLabels.size() - 1)
        {
            page = HPDF_AddPage(pdf);
            HPDF_Page_SetSize(page, HPDF_PAGE_SIZE_A4, HPDF_PAGE_PORTRAIT);
            startY = 750;
            row = 0;

            // Repetir encabezado en nueva página
            HPDF_Page_BeginText(page);
            HPDF_Page_SetFontAndSize(page, font, 16);
            HPDF_Page_TextOut(page, 50, 800, titulo.c_str());
            HPDF_Page_EndText(page);

            HPDF_Page_BeginText(page);
            HPDF_Page_SetFontAndSize(page, font, 14);
            HPDF_Page_TextOut(page, 50, 770, header.c_str());
            HPDF_Page_EndText(page);

            HPDF_Page_BeginText(page);
            HPDF_Page_SetFontAndSize(page, font, 12);
            HPDF_Page_TextOut(page, startX, startY, "Franja Horaria");
            HPDF_Page_TextOut(page, startX + 150, startY, "Empresa Ponente");
            HPDF_Page_EndText(page);

            startY -= 30;
        }
    }
}

// Modificar la función generatePDF para incluir ambas tablas
void generatePDF(const vector<Assignment> &assignments,
                 const vector<string> &timeLabels,
                 const vector<Ponente> &ponentes,
                 const vector<Asistente> &asistentes,
                 const string &titulo)
{

    HPDF_Doc pdf = HPDF_New(nullptr, nullptr);

    // Configuración UTF-8
    HPDF_UseUTFEncodings(pdf);
    HPDF_SetCurrentEncoder(pdf, "UTF-8");
    if (!pdf)
    {
        cerr << "Error al crear documento PDF" << endl;
        return;
    }

    HPDF_SetCompressionMode(pdf, HPDF_COMP_ALL);
    HPDF_SetPageMode(pdf, HPDF_PAGE_MODE_USE_OUTLINE);

    try
    {
        // Primero las páginas por ponente
        for (const auto &ponente : ponentes)
        {
            createPonentePage(pdf, ponente.id, assignments, asistentes, timeLabels, titulo);
        }

        // Luego las páginas por asistente
        for (const auto &asistente : asistentes)
        {
            createAsistentePage(pdf, asistente, assignments, timeLabels, titulo);
        }

        HPDF_SaveToFile(pdf, "agenda_completa.pdf");
        cout << "PDF generado exitosamente: agenda_completa.pdf" << endl;
    }
    catch (...)
    {
        cerr << "Error durante la generación del PDF" << endl;
    }

    HPDF_Free(pdf);
}
// Función auxiliar para quitar comillas si las hay
string removeQuotes(const string &s)
{
    string res = trim(s);
    if (res.size() >= 2 && res.front() == '"' && res.back() == '"')
        return res.substr(1, res.size() - 2);
    return res;
}

// Lee preasignaciones desde un archivo CSV que ahora tiene 5 columnas:
// "asistente", "nombre", "empresa", "ponente", "slot"
// Si sólo hay 3 columnas (versión antigua), se leen solo las 3 primeras.
vector<Assignment> readPreassignedCSV(const string &filename)
{
    vector<Assignment> preassigned;
    ifstream inFile(filename);
    if (!inFile.is_open())
    {
        cout << "No se encontró el archivo de preasignaciones (" << filename << "), se procede sin ellas." << endl;
        return preassigned;
    }
    string line;
    bool firstLine = true;
    while (getline(inFile, line))
    {
        if (line.empty())
            continue;
        if (firstLine)
        {
            firstLine = false; // omitir cabecera
            continue;
        }
        vector<string> fields = split(line, ',');
        if (fields.size() < 3)
            continue;
        Assignment asgn;
        asgn.asistente = removeQuotes(fields[0]);
        if (fields.size() >= 5)
        {
            asgn.asistenteName = removeQuotes(fields[1]);
            asgn.asistenteCompany = removeQuotes(fields[2]);
            asgn.ponente = removeQuotes(fields[3]);
            try
            {
                asgn.slot = stoi(removeQuotes(fields[4]));
            }
            catch (const invalid_argument &e)
            {
                cerr << "Valor inválido para slot (" << removeQuotes(fields[4])
                     << ") en la línea: " << line << ". Se omite esta línea." << endl;
                continue;
            }
        }
        else
        {
            // Versión antigua: sólo se leen asistente, ponente y slot
            asgn.ponente = removeQuotes(fields[1]);
            try
            {
                asgn.slot = stoi(removeQuotes(fields[2]));
            }
            catch (const invalid_argument &e)
            {
                cerr << "Valor inválido para slot (" << removeQuotes(fields[2])
                     << ") en la línea: " << line << ". Se omite esta línea." << endl;
                continue;
            }
        }
        preassigned.push_back(asgn);
    }
    inFile.close();
    return preassigned;
}

// Guarda las preasignaciones en un archivo CSV con 5 columnas
// (asistente, nombre, empresa, ponente, slot)
void savePreassignedCSV(const vector<Assignment> &preassigned, const string &filename)
{
    ofstream outFile(filename, ios::binary);
    if (!outFile.is_open())
    {
        cerr << "Error al abrir " << filename << " para escribir." << endl;
        return;
    }

    // Escribir la cabecera
    outFile << "asistente,nombre,empresa,ponente,slot\n";
    for (const auto &asgn : preassigned)
    {
        outFile << asgn.asistente << ","
                << asgn.asistenteName << ","
                << asgn.asistenteCompany << ","
                << asgn.ponente << ","
                << asgn.slot << "\n";
    }
    outFile.close();
    cout << "Citas preasignadas guardadas en: " << filename << endl;
}

int main(int argc, char *argv[])
{
    // Primer parámetro: tiempo máximo (por defecto 120)
    int maxSeconds = (argc > 1) ? atoi(argv[1]) : 120;
    // Segundo parámetro: CSV de asistentes (por defecto "data.csv")
    string filename = (argc > 2) ? argv[2] : "data.csv";
    // Tercer parámetro: CSV de preasignaciones (por defecto "prefijadas.csv")
    string preassignedFile = (argc > 3) ? argv[3] : "prefijadas.csv";

    // Leer asistentes desde el CSV de entrada
    vector<Asistente> asistentes = parseCSV(filename);
    cout << "Asistentes leídos:\n";
    for (const auto &a : asistentes)
    {
        cout << a.id << " (" << a.name << ", " << a.company << ")\n";
    }

    // Extraer ponentes a partir de las solicitudes (cada solicitud es una "E")
    set<string> ponentesSet;
    for (const auto &a : asistentes)
        for (const auto &r : a.requests)
            ponentesSet.insert(r);
    vector<Ponente> ponentes;
    for (const auto &p : ponentesSet)
        ponentes.push_back({p});

    vector<int> slotIndices = {0, 1, 2, 3, 4};
    vector<string> timeLabels = {
        "13:15 - 13:25",
        "13:25 - 13:35",
        "13:35 - 13:45",
        "13:45 - 13:55",
        "13:55 - 14:05"};

    // Leer preasignaciones desde archivo (si existe)
    vector<Assignment> preassignedAppointments = readPreassignedCSV(preassignedFile);

    // Si hay preasignaciones, fusionar información:
    // Agregar al vector de asistentes aquellos que aparecen en las preasignaciones pero no en el CSV principal.
    if (!preassignedAppointments.empty())
    {
        set<string> emailsAsistentes;
        for (const auto &a : asistentes)
            emailsAsistentes.insert(a.id);
        for (const auto &pref : preassignedAppointments)
        {
            if (emailsAsistentes.find(pref.asistente) == emailsAsistentes.end())
            {
                Asistente nuevo;
                nuevo.id = pref.asistente;
                nuevo.name = pref.asistenteName;       // Campo que se debe haber guardado en la preasignación
                nuevo.company = pref.asistenteCompany; // Campo que se debe haber guardado en la preasignación
                asistentes.push_back(nuevo);
            }
        }
    }

    // Definir el orden natural de los asistentes (0, 1, 2, ...)
    vector<int> order(asistentes.size());
    for (int i = 0; i < (int)asistentes.size(); i++)
    {
        order[i] = i;
    }

    // Llamar al algoritmo de asignación mediante un wrapper que decide según si hay preasignaciones.
    vector<Assignment> bestSchedule = multiGreedyScheduleAuto(asistentes, ponentes, slotIndices, maxSeconds, preassignedAppointments);
    printSchedule(bestSchedule, timeLabels);

    string titulo = "AGENDA DE REUNIONES - EMPRESAS Y ASISTENTES";
    generatePDF(bestSchedule, timeLabels, ponentes, asistentes, titulo);
    generateCSVs(bestSchedule, timeLabels, ponentes, asistentes);

    // Actualizar (guardar) el CSV de preasignaciones con el resultado obtenido
    savePreassignedCSV(bestSchedule, preassignedFile);

    return 0;
}
