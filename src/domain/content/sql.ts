/** Original self-contained SQLite examples: no personal data, remote tables or dependencies. */
export const sqlExamples: readonly {readonly titleRu:string;readonly titleEn:string;readonly text:string}[] = [
  {
    "titleRu": "Литералы",
    "titleEn": "Literals",
    "text": "SELECT 7 AS units, 'draft' AS status;"
  },
  {
    "titleRu": "Арифметика",
    "titleEn": "Arithmetic",
    "text": "SELECT 18 + 6 AS total, 18 / 3 AS ratio;"
  },
  {
    "titleRu": "Псевдонимы",
    "titleEn": "Aliases",
    "text": "SELECT 'north' AS region, 42 AS count;"
  },
  {
    "titleRu": "CASE",
    "titleEn": "CASE expression",
    "text": "SELECT CASE WHEN 8 > 5 THEN 'ready' ELSE 'wait' END AS state;"
  },
  {
    "titleRu": "NULL",
    "titleEn": "NULL values",
    "text": "SELECT COALESCE(NULL, 'unknown') AS label;"
  },
  {
    "titleRu": "Округление",
    "titleEn": "Rounding",
    "text": "SELECT ROUND(12.345, 2) AS price;"
  },
  {
    "titleRu": "Строки",
    "titleEn": "Strings",
    "text": "SELECT UPPER('tykora') AS app, LENGTH('practice') AS letters;"
  },
  {
    "titleRu": "Объединение",
    "titleEn": "Concatenation",
    "text": "SELECT 'weekly' || ' ' || 'report' AS heading;"
  },
  {
    "titleRu": "Список значений",
    "titleEn": "Value rows",
    "text": "WITH items(category, amount) AS (VALUES ('paper', 2), ('ink', 5)) SELECT category, amount FROM items;"
  },
  {
    "titleRu": "Фильтр",
    "titleEn": "Filtering",
    "text": "WITH items(amount) AS (VALUES (3), (9), (12)) SELECT amount FROM items WHERE amount >= 9;"
  },
  {
    "titleRu": "Сортировка",
    "titleEn": "Sorting",
    "text": "WITH items(word) AS (VALUES ('zebra'), ('apple'), ('mint')) SELECT word FROM items ORDER BY word;"
  },
  {
    "titleRu": "Ограничение",
    "titleEn": "Limits",
    "text": "WITH events(n) AS (VALUES (5), (3), (8)) SELECT n FROM events ORDER BY n DESC LIMIT 2;"
  },
  {
    "titleRu": "COUNT",
    "titleEn": "Counting",
    "text": "WITH tasks(done) AS (VALUES (1), (0), (1)) SELECT COUNT(*) AS total FROM tasks;"
  },
  {
    "titleRu": "SUM",
    "titleEn": "Totals",
    "text": "WITH sales(value) AS (VALUES (12), (16), (9)) SELECT SUM(value) AS revenue FROM sales;"
  },
  {
    "titleRu": "AVG",
    "titleEn": "Averages",
    "text": "WITH scores(point) AS (VALUES (7), (8), (9)) SELECT AVG(point) AS mean FROM scores;"
  },
  {
    "titleRu": "GROUP BY",
    "titleEn": "Grouping",
    "text": "WITH logs(team) AS (VALUES ('a'), ('b'), ('a')) SELECT team, COUNT(*) AS events FROM logs GROUP BY team;"
  },
  {
    "titleRu": "HAVING",
    "titleEn": "Group filtering",
    "text": "WITH logs(team) AS (VALUES ('a'), ('b'), ('a')) SELECT team, COUNT(*) AS n FROM logs GROUP BY team HAVING COUNT(*) > 1;"
  },
  {
    "titleRu": "DISTINCT",
    "titleEn": "Unique values",
    "text": "WITH labels(name) AS (VALUES ('draft'), ('done'), ('draft')) SELECT DISTINCT name FROM labels;"
  },
  {
    "titleRu": "JOIN",
    "titleEn": "Joining sets",
    "text": "WITH people(id, name) AS (VALUES (1, 'Ada'), (2, 'Lin')), jobs(person_id, role) AS (VALUES (1, 'editor'), (2, 'analyst')) SELECT people.name, jobs.role FROM people JOIN jobs ON jobs.person_id = people.id;"
  },
  {
    "titleRu": "LEFT JOIN",
    "titleEn": "Optional matches",
    "text": "WITH people(id) AS (VALUES (1), (2)), visits(person_id) AS (VALUES (2)) SELECT people.id, visits.person_id FROM people LEFT JOIN visits ON visits.person_id = people.id;"
  },
  {
    "titleRu": "Подзапрос",
    "titleEn": "Subquery",
    "text": "WITH scores(point) AS (VALUES (4), (8), (10)) SELECT point FROM scores WHERE point > (SELECT AVG(point) FROM scores);"
  },
  {
    "titleRu": "UNION",
    "titleEn": "Combining rows",
    "text": "SELECT 'north' AS zone UNION SELECT 'south' AS zone;"
  },
  {
    "titleRu": "Оконная функция",
    "titleEn": "Window function",
    "text": "WITH points(name, score) AS (VALUES ('A', 8), ('B', 12)) SELECT name, RANK() OVER (ORDER BY score DESC) AS place FROM points;"
  },
  {
    "titleRu": "Рекурсивный CTE",
    "titleEn": "Recursive CTE",
    "text": "WITH RECURSIVE ticks(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM ticks WHERE n < 4) SELECT n FROM ticks;"
  }
];
